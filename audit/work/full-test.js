const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await (await browser.newContext({ viewport:{width:390,height:844} })).newPage();
  const errs = [], bad = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('response', r => { if (r.status() >= 400) bad.push(r.url() + ' ' + r.status()); });
  page.on('dialog', d => d.accept());
  await page.goto('http://127.0.0.1:8765/', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(6000);
  try { await page.locator('#knowledgeStartBtn').click({timeout:2000}); } catch {}

  const out = {};
  // 1 subject filter counts
  out.filters = {};
  for (const sub of ['民法','刑法','行政法','知识产权法','宪法','商经法']) {
    await page.locator(`#filterBar [data-subject="${sub}"]`).click();
    await page.waitForTimeout(400);
    out.filters[sub] = await page.evaluate(() => document.getElementById('progressText').innerText);
  }
  await page.locator('#filterBar [data-subject="全部"]').click();
  await page.waitForTimeout(400);

  // 2 knowledge review panel
  await page.locator('#krToggleBtn').click();
  await page.waitForTimeout(600);
  out.kr = await page.evaluate(() => ({
    open: document.getElementById('knowledgeReviewPanel').classList.contains('show'),
    groups: document.querySelectorAll('.kr-subject-group').length,
    total: document.getElementById('krTotalCount').innerText,
  }));
  await page.locator('#krToggleBtn').click();
  await page.waitForTimeout(300);

  // 3 wrong book after wrong answer
  await page.locator('#optionsContainer .option').first().click();
  await page.waitForTimeout(400);
  if (await page.locator('#nextBtn').innerText().then(t=>t.includes('提交'))) {
    await page.locator('#nextBtn').click();
    await page.waitForTimeout(400);
  }
  out.wrong = await page.evaluate(() => ({
    count: document.getElementById('wrongCount').innerText,
    items: document.querySelectorAll('.wrong-item').length,
  }));

  // 4 sm2 review
  await page.locator('#sm2ReviewBtn').click();
  await page.waitForTimeout(800);
  out.sm2 = await page.evaluate(() => ({
    banner: document.getElementById('redoBanner').innerText.slice(0,80),
    shown: document.getElementById('redoBanner').classList.contains('show'),
  }));
  const exit = page.locator('#sm2ExitBtn');
  if (await exit.isVisible().catch(()=>false)) { await exit.click(); await page.waitForTimeout(400); }

  // 5 redo mode
  await page.locator('.filter-btn.redo').click();
  await page.waitForTimeout(700);
  out.redo = await page.evaluate(() => ({
    banner: document.getElementById('redoBanner').innerText.slice(0,60),
    shown: document.getElementById('redoBanner').classList.contains('show'),
    q: document.getElementById('questionText').innerText.slice(0,40),
  }));
  const redoExit = page.locator('#redoExitBtn');
  if (await redoExit.isVisible().catch(()=>false)) { await redoExit.click(); await page.waitForTimeout(400); }

  // 6 exam 卷一
  await page.locator('#examBtn').click();
  await page.waitForTimeout(300);
  await page.selectOption('#examPaperSelect','客观题卷一');
  await page.fill('#examQuestionCount','10');
  await page.fill('#examTimeLimit','10');
  await page.locator('#examConfigStart').click();
  await page.waitForTimeout(1200);
  out.exam1 = await page.evaluate(() => ({
    countdown: document.getElementById('examCountdown').innerText,
    progress: document.getElementById('examProgress').innerText,
    subject: (document.querySelector('#questionMeta .tag-subject')||{}).innerText,
  }));
  // answer all 10 and submit
  for (let i=0;i<10;i++){
    const opt = page.locator('#optionsContainer .option').first();
    if (await opt.count()) await opt.click();
    await page.waitForTimeout(120);
    if (await page.locator('#nextBtn').innerText().then(t=>t.includes('提交'))) {
      await page.locator('#nextBtn').click();
      break;
    }
    await page.locator('#nextBtn').click();
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(1200);
  out.examResult = await page.evaluate(() => {
    const el = document.getElementById('examResults');
    return { display: el.style.display, text: el.innerText.slice(0,180) };
  });
  // back to normal
  const back = page.locator('#examBackBtn');
  if (await back.isVisible().catch(()=>false)) { await back.click(); await page.waitForTimeout(600); }
  out.afterExam = await page.evaluate(() => ({
    q: (document.getElementById('questionText')||{}).innerText?.slice(0,30),
    subject: (document.querySelector('#questionMeta .tag-subject')||{}).innerText,
    progress: document.getElementById('progressText').innerText,
    redoVisible: getComputedStyle(document.querySelector('.filter-btn.redo')).display,
  }));

  // 7 theme toggle
  await page.locator('#themeToggleBtn').click();
  await page.waitForTimeout(400);
  out.theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));

  // 8 export csv
  const dl = page.waitForEvent('download', {timeout:5000}).catch(()=>null);
  await page.locator('#exportCsvBtn').click();
  const download = await dl;
  out.export = download ? download.suggestedFilename() : 'no-download';

  console.log(JSON.stringify({out, errs, bad}, null, 1));
  await browser.close();
})();
