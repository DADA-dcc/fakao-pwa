const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await (await browser.newContext({ viewport:{width:390,height:844} })).newPage();
  const errs=[]; page.on('pageerror', e=>errs.push(e.message));
  page.on('dialog', async d => { console.log('DIALOG', d.message()); await d.accept(); });
  await page.goto('http://127.0.0.1:8765/', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(6000);
  try { await page.locator('#knowledgeStartBtn').click({timeout:2000}); } catch {}
  await page.locator('#examBtn').click();
  await page.waitForTimeout(300);
  await page.fill('#examQuestionCount','10');
  await page.fill('#examTimeLimit','10');
  await page.locator('#examConfigStart').click();
  await page.waitForTimeout(800);
  for (let i=0;i<14;i++){
    const st = await page.evaluate(() => ({
      prog: document.getElementById('examProgress')?.innerText,
      btn: document.getElementById('nextBtn')?.innerText,
      card: document.getElementById('questionCard').style.display,
      results: document.getElementById('examResults').style.display,
    }));
    console.log(i, st);
    if (st.results === 'block') break;
    const opts = page.locator('#optionsContainer .option');
    const n = await opts.count();
    for (let k=0;k<n;k++) await opts.nth(k).click({timeout:2000}).catch(()=>{});
    await page.waitForTimeout(150);
    await page.locator('#nextBtn').click({timeout:3000}).catch(e=>console.log('next err', e.message.slice(0,60)));
    await page.waitForTimeout(300);
  }
  console.log('final', await page.evaluate(() => ({
    results: document.getElementById('examResults').style.display,
    text: document.getElementById('examResults').innerText.slice(0,300),
  })));
  console.log('errs', errs);
  await browser.close();
})();
