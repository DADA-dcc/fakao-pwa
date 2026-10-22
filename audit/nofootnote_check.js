// 验证：无 footnote 字段的题渲染干净（无空容器/多余留白），且选项点击不受影响。
const fs = require('fs');
const path = require('path');
const { chromium } = require('./work/node_modules/playwright');

const ROOT = path.resolve(__dirname, '..');
const QDIR = path.join(ROOT, 'questions');
const URL = process.env.APP_URL || 'http://127.0.0.1:8765/';

const byId = new Map();
const all = [];
for (const f of fs.readdirSync(QDIR).filter(x => x.endsWith('.json') && x !== 'index.json')) {
  for (const q of JSON.parse(fs.readFileSync(path.join(QDIR, f), 'utf8'))) {
    all.push(q);
    byId.set(q.id, q);
  }
}

// 无 footnote 的样本：覆盖单选/多选，且题目可唯一检索
const CANDIDATES = all.filter(q => !q.footnote && (q.type === '单选' || q.type === '多选'));

function normalize(s) { return String(s || '').replace(/\s+/g, ''); }
const corpus = all.map(x => (x.question || '') + Object.values(x.options || {}).join('')).join('\u0000');
function uniqueSearchText(q) {
  const src = q.question || '';
  for (let len = 8; len <= Math.min(40, src.length); len++) {
    const sub = src.slice(0, len);
    const first = corpus.indexOf(sub);
    if (first !== -1 && corpus.indexOf(sub, first + 1) === -1) return sub;
  }
  return null;
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

  // 取 6 道可唯一检索的无 footnote 题
  const picked = [];
  for (const q of CANDIDATES) {
    const s = uniqueSearchText(q);
    if (s) picked.push({ q, s });
    if (picked.length >= 6) break;
  }

  const results = [];
  for (const { q, s } of picked) {
    const r = { id: q.id, type: q.type, checks: {}, errors: [] };
    try {
      await page.locator('#searchInput').fill(s);
      await page.waitForTimeout(450);
      const item = page.locator(`#searchResults .search-result-item[data-qid="${q.id}"]`);
      if (!(await item.count())) { r.errors.push('未找到'); results.push(r); continue; }
      await item.first().click();
      await page.waitForTimeout(450);

      const dom = await page.evaluate(() => {
        const opts = [...document.querySelectorAll('#optionsContainer .option')];
        return {
          noteCount: document.querySelectorAll('#optionsContainer .option-note').length,
          footCount: document.querySelectorAll('#optionsContainer .option-footnote').length,
          // 选项文本容器里不应有多余空块
          empties: opts.filter(e => {
            const body = e.querySelector('div:nth-child(2)');
            return body && body.children.length > 0;
          }).length,
          optCount: opts.length,
        };
      });

      r.checks.noNote = dom.noteCount === 0;
      r.checks.noFootnote = dom.footCount === 0;
      r.checks.noEmptyChildren = dom.empties === 0;

      if (!r.checks.noNote) r.errors.push('渲染了多余的 ※ 标记');
      if (!r.checks.noFootnote) r.errors.push('渲染了空的脚注容器');
      if (!r.checks.noEmptyChildren) r.errors.push('选项内有多余空块');

      // 选项点击回归：点每个选项都应产生选中/判题效果
      const letters = String(q.answer).replace(/[^A-D]/g, '').split('');
      for (const l of letters) {
        await page.locator(`#optionsContainer .option[data-option="${l}"] .option-label`).click();
        await page.waitForTimeout(150);
      }
      if (q.type === '多选') await page.locator('#nextBtn').click();
      await page.waitForTimeout(600);

      const after = await page.evaluate(() => ({
        result: document.getElementById('resultBanner').innerText,
        correct: [...document.querySelectorAll('#optionsContainer .option.correct')].map(el => el.dataset.option).sort().join(''),
      }));
      r.checks.answerCorrect = /回答正确/.test(after.result || '');
      r.checks.correctOptions = after.correct === letters.slice().sort().join('');
      if (!r.checks.answerCorrect) r.errors.push('判题未显示回答正确');
      if (!r.checks.correctOptions) r.errors.push('正确选项高亮不符');
    } catch (e) {
      r.errors.push(e.message.split('\n')[0]);
    }
    r.pass = r.errors.length === 0;
    results.push(r);
    console.log(`${r.pass ? 'PASS' : 'FAIL'} ${q.id} ${q.type}${r.errors.length ? ' :: ' + r.errors.join('；') : ''}`);
  }

  const out = { generatedAt: new Date().toISOString(), url: URL, total: results.length, pass: results.filter(r => r.pass).length, fail: results.filter(r => !r.pass).length, consoleErrors: errs, results };
  fs.writeFileSync(path.join(ROOT, 'audit', 'outbox', 'nofootnote_check.json'), JSON.stringify(out, null, 2), 'utf8');
  console.log(JSON.stringify({ total: out.total, pass: out.pass, fail: out.fail, consoleErrors: errs.length }));
  await browser.close();
  process.exit(out.fail ? 1 : 0);
})();
