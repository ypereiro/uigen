const { chromium } = require('playwright');

async function clickCodeTab() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Click the Code tab
  const codeTab = page.locator('text=Code').first();
  if (await codeTab.isVisible()) {
    await codeTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/06-code-view.png', fullPage: true });
    console.log('✓ Code tab screenshot saved');
  }
  
  await page.waitForTimeout(5000);
  await browser.close();
}

clickCodeTab().catch(console.error);
