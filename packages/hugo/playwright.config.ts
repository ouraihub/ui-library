import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 测试配置
 * 
 * 用于测试 Hugo 主题组件在真实浏览器环境中的行为
 */
export default defineConfig({
  // 测试目录
  testDir: './__tests__/e2e',
  
  // 测试匹配模式
  testMatch: '**/*.spec.ts',
  
  // 完全并行运行测试
  fullyParallel: true,
  
  // CI 环境下禁止重试，本地开发允许重试一次
  retries: process.env.CI ? 0 : 1,
  
  // 并发工作进程数
  workers: process.env.CI ? 1 : undefined,
  
  // 测试报告配置
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  
  // 全局测试配置
  use: {
    // 基础 URL - 指向 Hugo 开发服务器
    baseURL: process.env.BASE_URL || 'http://localhost:1313',
    
    // 测试追踪 - 仅在首次重试时记录
    trace: 'on-first-retry',
    
    // 截图 - 仅在失败时
    screenshot: 'only-on-failure',
    
    // 视频 - 仅在首次重试时
    video: 'retain-on-failure',
  },

  // 测试项目配置 - 多浏览器测试
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // 移动端测试（可选）
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Web 服务器配置（可选）
  // 如果需要自动启动 Hugo 服务器，取消注释以下配置
  // webServer: {
  //   command: 'cd ../../hugo-theme-paper && hugo server',
  //   url: 'http://localhost:1313',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
