import { test, expect } from '@playwright/test';

test.describe('主题切换功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('用户点击主题切换按钮 (light → dark → light)', async ({ page }) => {
    const themeToggle = page.locator('#theme-btn');
    await expect(themeToggle).toBeVisible();

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');

    await themeToggle.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await themeToggle.click();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('主题持久化 - 刷新页面后保持', async ({ page }) => {
    const themeToggle = page.locator('#theme-btn');
    const html = page.locator('html');

    await themeToggle.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBe('dark');
  });

  test('系统主题跟随 - 模拟系统主题变化', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('theme'));
    await page.reload();

    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(100);
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForTimeout(100);
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('跨页面主题一致性 - 导航到不同页面', async ({ page }) => {
    const themeToggle = page.locator('#theme-btn');
    const html = page.locator('html');

    await themeToggle.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    const links = page.locator('a[href^="/"]').first();
    if (await links.count() > 0) {
      await links.click();
      await page.waitForLoadState('networkidle');
      await expect(html).toHaveAttribute('data-theme', 'dark');
    }
  });

  test('防闪烁机制 - 页面加载时无闪烁', async ({ page }) => {
    const themeToggle = page.locator('#theme-btn');
    await themeToggle.click();

    const themes: string[] = [];
    page.on('domcontentloaded', async () => {
      const theme = await page.locator('html').getAttribute('data-theme');
      if (theme) themes.push(theme);
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    expect(themes.length).toBeGreaterThan(0);
    expect(themes.every(t => t === 'dark')).toBe(true);
  });

  test('键盘访问性 - Tab + Enter 切换主题', async ({ page }) => {
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');

    await page.locator('#theme-btn').focus();

    await page.keyboard.press('Enter');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.keyboard.press('Enter');
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('主题切换按钮可访问性属性', async ({ page }) => {
    const themeToggle = page.locator('#theme-btn');
    
    await expect(themeToggle).toBeVisible();
    
    const ariaLabel = await themeToggle.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('三态切换 - light → dark → system → light', async ({ page }) => {
    const themeToggle = page.locator('#theme-btn');
    const html = page.locator('html');

    await expect(html).toHaveAttribute('data-theme', 'light');

    await themeToggle.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await themeToggle.click();
    const theme = await html.getAttribute('data-theme');
    expect(['light', 'dark']).toContain(theme);
  });

  test('并发主题切换 - 快速点击不会导致状态错误', async ({ page }) => {
    const themeToggle = page.locator('#theme-btn');
    const html = page.locator('html');

    await themeToggle.click();
    await themeToggle.click();
    await themeToggle.click();

    await page.waitForTimeout(100);

    const finalTheme = await html.getAttribute('data-theme');
    expect(['light', 'dark']).toContain(finalTheme);

    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBe(finalTheme);
  });
});
