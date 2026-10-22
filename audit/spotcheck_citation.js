// 抽查 3 道 citation_current 改动题（5230 / 8232 / 8748）的 UI 渲染 + 答案判定。
// 结果与截图写入 audit/outbox/。
const fs = require('fs');
const path = require('path');
const { chromium } = require('./work/node_modules/playwright');

const ROOT = path.resolve(__dirname, '..');
const QDIR = path.join(ROOT, 'questions');
const OUTDIR = path.join(ROOT, 'audit', 'outbox');
const URL = process.env.APP_URL || 'http://127.0.0.1:8765/';
const IDS = [5230, 8232, 8748];

// 改动后必须出现的新术语；旧术语不得残留在题干
const EXPECT = {
  5230: { field: 'analysis', must: ['《民法典》合同编'], mustNot: [] },
  8232: { field: 'question', must: ['第一千零六十一条'], mustNot: ['《婚姻法》'] },
  8748: { field: 'question', must: ['第155条', '第617条'], mustNot: ['《合同法》第135条'] },
};

const all = [];
const byId = new Map();
for (const f of fs.readdirSync(QDIR).filter(x => x.endsWith('.json') && x !== 'index.json')) {
  for (const q of JSON.parse(fs.readFileSync(path.join(QDIR, f), 'utf8'))) {
    all.push(q);
    byId.set(q.id, q);
  }
}

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

const PROBES = { 5230: '应由《民法典》合同编调整', 8232: '第一千零六十一条', 8748: '第617条' };

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })).newPage();
  const consoleErrors = [];
  page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push('console: ' + m.text()); });
  page.on('dialog', d => d.accept());

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  try { await page.locator('#knowledgeStartBtn').click({ timeout: 2000 }); } catch {}
  await page.waitForTimeout(500);

  const results = [];
  for (const id of IDS) {
    const q = byId.get(id);
    const exp = EXPECT[id];
    const r = { id, subject: q.subject, type: q.type, answer: q.answer, checks: {}, pass: false, errors: [] };
    try {
      await page.locator('#searchInput').fill(uniqueSearchText(q));
      await page.waitForTimeout(450);
      const item = page.locator(`#searchResults .search-result-item[data-qid="${id}"]`);
      if (!(await item.count())) {
        r.errors.push('搜索结果中未找到该题');
        results.push(r);
        console.log(`FAIL ${id} 未找到`);
        continue;
      }
      await item.first().click();
      await page.waitForTimeout(500);

      const shown = await page.evaluate(() => ({
        meta: document.getElementById('questionMeta').innerText,
        qText: document.getElementById('questionText').innerText,
        options: Object.fromEntries([...document.querySelectorAll('#optionsContainer .option')].map(el => [el.dataset.option, el.innerText])),
        result: document.getElementById('resultBanner').innerText,
      }));

      r.checks.idTag = shown.meta.includes('#' + id);
      r.checks.questionMatch = normalize(shown.qText) === normalize(q.question);
      r.checks.optionsMatch = Object.keys(q.options || {}).every(l => normalize(shown.options[l] || '').includes(normalize(q.options[l])));
      r.checks.beforeAnswerHidden = !/回答正确|回答错误/.test(shown.result || '');
      if (!r.checks.idTag) r.errors.push('题号标签不符');
      if (!r.checks.questionMatch) r.errors.push('题干渲染不一致');
      if (!r.checks.optionsMatch) r.errors.push('选项渲染不一致');

      const letters = String(q.answer).replace(/[^A-D]/g, '').split('');
      for (const l of letters) {
        await page.locator(`#optionsContainer .option[data-option="${l}"]`).click();
        await page.waitForTimeout(120);
      }
      if (q.type === '多选') await page.locator('#nextBtn').click();
      await page.waitForTimeout(600);

      const after = await page.evaluate(() => ({
        result: document.getElementById('resultBanner').innerText,
        analysis: document.getElementById('analysisBox').innerText,
        correct: [...document.querySelectorAll('#optionsContainer .option.correct')].map(el => el.dataset.option).sort().join(''),
      }));
      r.checks.answerCorrect = /回答正确/.test(after.result || '');
      r.checks.correctOptions = after.correct === letters.slice().sort().join('');

      const renderedText = normalize(exp.field === 'question' ? shown.qText : after.analysis);
      r.checks.newTermPresent = exp.must.every(t => renderedText.includes(normalize(t)));
      r.checks.oldTermGone = exp.mustNot.every(t => !renderedText.includes(normalize(t)));
      if (!r.checks.answerCorrect) r.errors.push('答案判定未显示「回答正确」');
      if (!r.checks.correctOptions) r.errors.push('正确选项高亮不符：' + after.correct);
      if (!r.checks.newTermPresent) r.errors.push('新引用未渲染');
      if (!r.checks.oldTermGone) r.errors.push('旧引用仍残留');

      const shot = path.join(OUTDIR, `spot_citation_${id}.png`);
      await page.screenshot({ path: shot });
      r.screenshot = 'audit/outbox/' + path.basename(shot);
      r.pass = r.errors.length === 0;
    } catch (e) {
      r.errors.push(e.message.split('\n')[0]);
    }
    results.push(r);
    console.log(`${r.pass ? 'PASS' : 'FAIL'} ${id} ${q.type} ${q.answer}${r.errors.length ? ' :: ' + r.errors.join('；') : ''}`);
  }

  const out = {
    generatedAt: new Date().toISOString(),
    url: URL,
    total: results.length,
    pass: results.filter(r => r.pass).length,
    fail: results.filter(r => !r.pass).length,
    consoleErrors,
    results,
  };
  fs.writeFileSync(path.join(OUTDIR, 'spotcheck_citation.json'), JSON.stringify(out, null, 2), 'utf8');
  console.log(JSON.stringify({ total: out.total, pass: out.pass, fail: out.fail, consoleErrors: consoleErrors.length }));
  await browser.close();
  process.exit(out.fail ? 1 : 0);
})();
