import { BrowserManager } from '../src/browser/manager';
import { BrowserTool } from '../src/browser/core/browser-tool';
import { getConfig, initialize } from '../src/index';
import pc from 'picocolors';

async function testBrowser() {
  const browserManager = new BrowserManager(getConfig());

  try {
    await initialize();
    console.log(pc.cyan('🚀 Launching browser...'));
    const context = await browserManager.launch();
    const page = context.pages()[0];

    const browserTool = new BrowserTool(
      page,
      browserManager,
      {
        width: 1920, 
        height: 1080
      }
    );

    // Navigate to a page with a sign in button
    await page.goto('http://localhost:3000');
    
    // Find the "Sign in" text/button and get its coordinates
    const signInElement = await page.locator('text="Sign in"').first();
    const boundingBox = await signInElement.boundingBox();
    
    if (!boundingBox) {
      throw new Error('Could not find Sign in element');
    }

    // Calculate center coordinates of the element
    const x = Math.round(boundingBox.x + boundingBox.width / 2);
    const y = Math.round(boundingBox.y + boundingBox.height / 2);
    
    console.log(pc.cyan(`📍 Sign in button coordinates: (${x}, ${y})`));

    // Test sequence
    console.log(pc.cyan('\n📍 Testing Mouse Movements and Clicks:'));
    
    // Move to sign in button
    console.log(pc.cyan(`\nTest 1: Move to Sign in button (${x}, ${y})`));
    const moveResult = await browserTool.execute({ 
      action: 'mouse_move', 
      coordinates: [x, y] 
    });
    console.log(pc.yellow('\nMouse Move Result:'), moveResult);
    console.log(pc.yellow('Metadata:'), moveResult.metadata);
    await new Promise(r => setTimeout(r, 1000));

    // Take screenshot to verify position
    console.log(pc.cyan('\nTest 2: Taking screenshot to verify cursor position'));
    const screenshotResult = await browserTool.execute({ 
      action: 'screenshot' 
    });
    console.log(pc.yellow('\nScreenshot Result:'), screenshotResult);
    console.log(pc.yellow('Metadata:'), screenshotResult.metadata);

    // Click the button
    console.log(pc.cyan('\nTest 3: Clicking at current position'));
    const clickResult = await browserTool.execute({ 
      action: 'left_click'
    });
    console.log(pc.yellow('\nClick Result:'), clickResult);
    console.log(pc.yellow('Metadata:'), clickResult.metadata);
    await new Promise(r => setTimeout(r, 1000));

    // Take final screenshot
    console.log(pc.cyan('\nTest 4: Taking screenshot after click'));
    const finalResult = await browserTool.execute({ 
      action: 'screenshot' 
    });
    console.log(pc.yellow('\nFinal Screenshot Result:'), finalResult);
    console.log(pc.yellow('Metadata:'), finalResult.metadata);
    
    console.log(pc.green('\n✅ All coordinate tests completed'));

  } catch (error) {
    console.error(pc.red('❌ Test failed:'), error);
  } finally {
    console.log(pc.cyan('\n🧹 Cleaning up...'));
    await browserManager.close();
  }
}

console.log(pc.cyan('🧪 Mouse Coordinate Test'));
console.log(pc.cyan('======================='));
testBrowser().catch(console.error);