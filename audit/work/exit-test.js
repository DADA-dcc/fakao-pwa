const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await (await browser.newContext({ viewport:{width:390,height:844} })).newPage();
  const errs=[]; page.on('pageerror', e=>errs.push(e.message));
  page.on('dialog', d => d.accept());
  await page.goto('http://127.0.0.1:8765/', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(6000);
  try { await page.locator('#knowledgeStartBtn').click({timeout:2000}); } catch {}
  console.log('before exam', await page.evaluate(()=>document.getElementById('progressText').innerText));
  await page.locator('#examBtn').click();
  await page.waitForTimeout(300);
  await page.fill('#examQuestionCount','10');
  await page.fill('#examTimeLimit','10');
  await page.locator('#examConfigStart').click();
  await page.waitForTimeout(800);
  console.log('in exam', await page.evaluate(()=>document.getElementById('progressText').innerText));
  // exit immediately via 交卷
  await page.locator('#examExitBtn').click();
  await page.waitForTimeout(1200);
  console.log('after submit', await page.evaluate(()=>({
    results: document.getElementById('examResults').style.display,
    back: !!document.getElementById('examBackBtn')
  })));
  await page.locator('#examBackBtn').click();
  await page.waitForTimeout(800);
  console.log('after back', await page.evaluate(()=>({
    progress: document.getElementById('progressText').innerText,
    results: document.getElementById('examResults').style.display,
    subject: (document.querySelector('#questionMeta .tag-subject')||{}).innerText,
    banner: document.getElementById('examBanner').style.display,
  })));
  console.log('errs', errs);
  await browser.close();
})();
