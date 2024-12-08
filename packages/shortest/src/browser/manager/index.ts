import { chromium, Browser, BrowserContext } from 'playwright';
import { getConfig } from '../../index';

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  async launch(): Promise<BrowserContext> {
    const config = getConfig();

    this.browser = await chromium.launch({
      headless: config.headless ?? false
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    const page = await this.context.newPage();
    if (config.baseUrl) {
      await page.goto(config.baseUrl);
      await page.waitForLoadState('networkidle');
    } else {
      throw new Error('Base URL is not set');
    }

    return this.context;
  }

  async clearContext(): Promise<BrowserContext> {
    if (!this.context) {
      throw new Error('No context available');
    }

    // Clear all browser state
    await Promise.all([
      this.context.clearCookies(),
      // Clear storage
      this.context.pages().map(page => 
        page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
          indexedDB.deleteDatabase('shortest');
        })
      ),
      // Clear permissions
      this.context.clearPermissions(),
    ]);

    // Navigate all pages to blank
    await Promise.all(
      this.context.pages().map(page => 
        page.goto('about:blank')
      )
    );

    // Close all pages except first
    const pages = this.context.pages();
    if (pages.length > 1) {
      await Promise.all(
        pages.slice(1).map(page => page.close())
      );
    }

    // Navigate first page to baseUrl
    const baseUrl = getConfig().baseUrl;
    if (baseUrl) {
      await pages[0].goto(baseUrl);
      await pages[0].waitForLoadState('networkidle');
    } else {
      throw new Error('Base URL is not set');
    }

    return this.context;
  }

  async recreateContext(): Promise<BrowserContext> {
    return this.clearContext();
  }

  private async closeContext(): Promise<void> {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
  }

  async close(): Promise<void> {
    await this.closeContext();
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  getContext(): BrowserContext | null {
    return this.context;
  }
} 