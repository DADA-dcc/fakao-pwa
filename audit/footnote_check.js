// 验证选项脚注：4494-C / 4542-C 的「※」可展开、不误触发选项选中。
const fs = require('fs');
const path = require('path');
const { chromium } = require('./work/node_modules/playwright');

const ROOT = path.resolve(__dirname, '..');
const QDIR = path.join(ROOT, 'questions');
const OUTDIR = path.join(ROOT, 'audit', 'outbox');
const URL = process.env.APP_URL || 'http://127.0.0.1:8765/';
const CASES = [
  { id: 4494, opt: 'C', type: '单选', answer: 'C' },
  { id: 4542, opt: 'C', type: '多选', answer: 'AC' },
];

const byId = new Map();
for (const f of fs.readdirSync(QDIR).filter(x => x.endsWith('.json') && x !== 'index.json')) {
  for (const q of JSON.parse(fs.readFileSync(path.join(QDIR, f), 'utf8'))) byId.set(q.id, q);
}

const all = [...byId.values()];
function normalize(s) { return String(s || '').replace(/\s+/g, ''); }
function uniqueSearchText(q) {
  const corpus = all.map(x => (x.question || '') + Object.values(x.options || {}).join('')).join('\u0000');
  const src = q.question || '';
  for (let len = 8; len <= Math.min(40, src.length); len++) {
    const sub = src.slice(0, len);
    const first = corpus.indexOf(sub);
    if (first !== -1 && corpus.indexOf(sub, first + 1) === -1) return sub;
  }
  return src.slice(0, 40);
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })).newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  page.on('dialog', d => d.accept());

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  try { await page.locator('#knowledgeStartBtn').click({ timeout: 2000 }); } catch {}
  await page.waitForTimeout(500);

  const results = [];
  for (const c of CASES) {
    const q = byId.get(c.id);
    const note = (q.footnote || {})[c.opt];
    const r = { id: c.id, opt: c.opt, checks: {}, pass: false, errors: [] };
    try {
      await page.locator('#searchInput').fill(uniqueSearchText(q));
      await page.waitForTimeout(450);
      const item = page.locator(`#searchResults .search-result-item[data-qid="${c.id}"]`);
      if (!(await item.count())) { r.errors.push('未找到题目'); results.push(r); console.log('FAIL', c.id, '未找到'); continue; }
      await item.first().click();
      await page.waitForTimeout(500);

      const optSel = `#optionsContainer .option[data-option="${c.opt}"]`;
      r.checks.hasNote = await page.locator(`${optSel} .option-note`).count() === 1;
      r.checks.footnoteHiddenInitially = !(await page.locator(`${optSel} .option-footnote`).isVisible());

      // 点「※」：应展开脚注，且不选中该选项
      await page.locator(`${optSel} .option-note`).click();
      await page.waitForTimeout(300);
      r.checks.footnoteOpens = await page.locator(`${optSel} .option-footnote`).isVisible();
      r.checks.noteText = normalize(await page.locator(`${optSel} .option-footnote`).innerText()) === normalize(note);
      r.checks.notSelectedByNote = !(await page.locator(optSel).evaluate(el => el.classList.contains('selected')));

      // 再点一次收起
      await page.locator(`${optSel} .option-note`).click();
      await page.waitForTimeout(300);
      r.checks.footnoteCloses = !(await page.locator(`${optSel} .option-footnote`).isVisible());

      // 展开脚注后点脚注区：应等同点该选项。
      // 单选点完立即判题（加 disabled/correct/wrong，不加 selected），多选加 selected。
      await page.locator(`${optSel} .option-note`).click();
      await page.waitForTimeout(200);
      await page.locator(`${optSel} .option-footnote`).click();
      await page.waitForTimeout(350);
      r.checks.footnoteClickSelects = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        return el.classList.contains('selected')
          || el.classList.contains('correct')
          || el.classList.contains('wrong');
      }, optSel);

      // 复位：重新进题，避免上一轮选择污染判题
      await page.locator('#searchInput').fill(uniqueSearchText(q));
      await page.waitForTimeout(450);
      await page.locator(`#searchResults .search-result-item[data-qid="${c.id}"]`).first().click();
      await page.waitForTimeout(500);
      const letters = String(c.answer).replace(/[^A-D]/g, '').split('');
      for (const l of letters) {
        // 点选项标签而非元素中心：脚注展开会撑高选项，中心点可能落在脚注区
        await page.locator(`#optionsContainer .option[data-option="${l}"] .option-label`).click();
        await page.waitForTimeout(150);
      }
      if (c.type === '多选') await page.locator('#nextBtn').click();
      await page.waitForTimeout(600);
      const after = await page.evaluate(() => ({
        result: document.getElementById('resultBanner').innerText,
        correct: [...document.querySelectorAll('#optionsContainer .option.correct')].map(el => el.dataset.option).sort().join(''),
      }));
      r.checks.answerCorrect = /回答正确/.test(after.result || '');
      r.checks.correctOptions = after.correct === letters.slice().sort().join('');

      if (!r.checks.hasNote) r.errors.push('无 ※ 标记');
      if (!r.checks.footnoteHiddenInitially) r.errors.push('脚注默认应隐藏');
      if (!r.checks.footnoteOpens) r.errors.push('点击后脚注未展开');
      if (!r.checks.noteText) r.errors.push('脚注文案不符');
      if (!r.checks.notSelectedByNote) r.errors.push('点 ※ 误选中了选项');
      if (!r.checks.footnoteCloses) r.errors.push('再次点击未收起');
      if (!r.checks.footnoteClickSelects) r.errors.push('点脚注区未选中选项（吞点击）');
      if (!r.checks.answerCorrect) r.errors.push('判题未显示回答正确');
      if (!r.checks.correctOptions) r.errors.push('正确选项高亮不符');

      const shot = path.join(OUTDIR, `footnote_${c.id}.png`);
      await page.screenshot({ path: shot });
      r.screenshot = 'audit/outbox/' + path.basename(shot);
      r.pass = r.errors.length === 0;
    } catch (e) {
      r.errors.push(e.message.split('\n')[0]);
    }
    results.push(r);
    console.log(`${r.pass ? 'PASS' : 'FAIL'} ${c.id} opt${c.opt}${r.errors.length ? ' :: ' + r.errors.join('；') : ''}`);
  }

  const out = { generatedAt: new Date().toISOString(), url: URL, total: results.length, pass: results.filter(r => r.pass).length, fail: results.filter(r => !r.pass).length, consoleErrors: errs, results };
  fs.writeFileSync(path.join(OUTDIR, 'footnote_check.json'), JSON.stringify(out, null, 2), 'utf8');
  console.log(JSON.stringify({ total: out.total, pass: out.pass, fail: out.fail, consoleErrors: errs.length }));
  await browser.close();
  process.exit(out.fail ? 1 : 0);
})();
