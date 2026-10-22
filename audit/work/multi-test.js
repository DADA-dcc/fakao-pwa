const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await (await browser.newContext({ viewport:{width:390,height:844} })).newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://127.0.0.1:8765/', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(6000);
  try { await page.locator('#knowledgeStartBtn').click({timeout:2000}); } catch {}

  // find multi-select with comma answer where stem is unique enough
  const targets = await page.evaluate(async () => {
    const out = [];
    for (const sub of ['民法','刑法','商经法']) {
      const r = await fetch('questions/' + encodeURIComponent(sub) + '.json');
      const d = await r.json();
      for (const q of d) {
        if (q.type === '多选' && q.answer && q.answer.includes(',') && q.question.length > 40) {
          out.push({ sub, id: q.id, ans: q.answer, stem: q.question.slice(0, 30) });
          if (out.length >= 6) break;
        }
      }
      if (out.length >= 6) break;
    }
    return out;
  });
  console.log('targets', targets.map(t=>t.id+':'+t.ans));

  const results = [];
  for (const t of targets) {
    await page.locator('#searchInput').fill(t.stem);
    await page.waitForTimeout(500);
    const items = page.locator('#searchResults .search-result-item');
    if (await items.count() === 0) { results.push({id:t.id, skip:true}); continue; }
    await items.first().click();
    await page.waitForTimeout(500);
    const meta = await page.evaluate(() => (document.querySelector('#questionMeta')||{}).innerText||'');
    const curId = (meta.match(/#(\d+)/)||[])[1];
    for (const a of t.ans.replace(/,/g,'').split('')) {
      const opt = page.locator(`#optionsContainer .option[data-option="${a}"]`);
      if (await opt.count()) await opt.click();
      await page.waitForTimeout(60);
    }
    await page.locator('#nextBtn').click();
    await page.waitForTimeout(500);
    const banner = await page.evaluate(() => document.querySelector('#resultBanner')?.innerText||'');
    results.push({id:t.id, curId, ans:t.ans, banner, ok:/正确/.test(banner)});
  }
  console.log(JSON.stringify(results,null,1));
  console.log('errs', errs);
  await browser.close();
})();
