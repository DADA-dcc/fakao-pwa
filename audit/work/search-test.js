const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await (await browser.newContext({ viewport:{width:390,height:844} })).newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://127.0.0.1:8765/', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(6000);
  try { await page.locator('#knowledgeStartBtn').click({timeout:2000}); } catch {}
  await page.locator('#searchInput').fill('押金');
  await page.waitForTimeout(700);
  const list = await page.evaluate(() => ({
    count: document.querySelectorAll('#searchResults .search-result-item').length,
    shown: document.getElementById('searchResults').classList.contains('show'),
    sample: (document.querySelector('#searchResults .sr-text')||{}).innerHTML,
  }));
  console.log(list);
  if (list.count) {
    await page.locator('#searchResults .search-result-item').first().click();
    await page.waitForTimeout(600);
    console.log('jumped', await page.evaluate(() => ({
      resultShown: document.getElementById('searchResults').classList.contains('show'),
      q: document.getElementById('questionText').innerText.slice(0,40),
    })));
  }
  console.log('errs', errs);
  await browser.close();
})();
