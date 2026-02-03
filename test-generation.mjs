import { chromium } from 'playwright';

async function testComponentGeneration() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to localhost:3000...');
    await page.goto('http://localhost:3000');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({ path: 'screenshots/01-initial.png', fullPage: true });
    console.log('Screenshot saved: 01-initial.png');

    // Find and fill the chat input
    console.log('Looking for chat input...');
    const input = await page.locator('textarea, input[type="text"]').first();
    await input.fill('create a simple button component');
    await page.waitForTimeout(500);

    // Take screenshot of input
    await page.screenshot({ path: 'screenshots/02-input-filled.png', fullPage: true });
    console.log('Screenshot saved: 02-input-filled.png');

    // Submit the form (try Enter key or look for submit button)
    await input.press('Enter');
    console.log('Submitted request...');

    // Wait for generation to complete (look for completion indicators)
    await page.waitForTimeout(5000);

    // Take screenshot after generation
    await page.screenshot({ path: 'screenshots/03-after-generation.png', fullPage: true });
    console.log('Screenshot saved: 03-after-generation.png');

    // Try to find the preview area or generated code
    await page.waitForTimeout(2000);

    // Take final screenshot
    await page.screenshot({ path: 'screenshots/04-final.png', fullPage: true });
    console.log('Screenshot saved: 04-final.png');

    // Get the page HTML to inspect structure
    const html = await page.content();
    console.log('\n=== Page Structure ===');
    console.log('Title:', await page.title());

    // Keep browser open for manual inspection
    console.log('\nBrowser will stay open for 30 seconds for inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'screenshots/error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testComponentGeneration();
