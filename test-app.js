const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testGeneration() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500  // Slow down for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    console.log('📱 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir);
    }

    console.log('📸 Taking initial screenshot...');
    await page.screenshot({ path: 'screenshots/01-initial.png', fullPage: true });

    // Find input field - try multiple selectors
    console.log('🔍 Looking for input field...');
    let input;

    // Try to find textarea
    const textareas = await page.locator('textarea').count();
    if (textareas > 0) {
      input = page.locator('textarea').first();
      console.log('✓ Found textarea');
    } else {
      // Try input fields
      const inputs = await page.locator('input[type="text"]').count();
      if (inputs > 0) {
        input = page.locator('input[type="text"]').first();
        console.log('✓ Found text input');
      }
    }

    if (!input) {
      console.log('❌ Could not find input field. Page HTML:');
      console.log(await page.content());
      return;
    }

    // Type a simple request
    console.log('⌨️  Typing request...');
    await input.fill('create a simple counter button');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/02-typed-input.png', fullPage: true });

    // Submit by pressing Enter
    console.log('↩️  Submitting...');
    await input.press('Enter');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/03-submitted.png', fullPage: true });

    // Wait for generation (the mock takes a few seconds)
    console.log('⏳ Waiting for generation...');
    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'screenshots/04-generated.png', fullPage: true });

    // Try to extract code from page
    console.log('📝 Extracting generated code...');
    const codeBlocks = await page.locator('pre code, code').allTextContents();
    if (codeBlocks.length > 0) {
      fs.writeFileSync('screenshots/generated-code.txt', codeBlocks.join('\n\n=====\n\n'));
      console.log(`✓ Found ${codeBlocks.length} code blocks, saved to generated-code.txt`);
    }

    // Look for preview
    const iframes = page.frames();
    console.log(`🖼️  Found ${iframes.length} frames on page`);

    // Final screenshot
    await page.screenshot({ path: 'screenshots/05-final.png', fullPage: true });

    console.log('\n✅ Test complete! Screenshots saved to screenshots/ folder');
    console.log('🔍 Inspect the screenshots to see the generated component styling');

    // Keep browser open for 10 seconds for manual inspection
    console.log('\n⏸️  Browser will stay open for 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'screenshots/error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('🔚 Browser closed');
  }
}

testGeneration().catch(console.error);
