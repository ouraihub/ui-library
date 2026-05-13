# E2E 测试指南

## 概述

本目录包含使用 Playwright 编写的端到端（E2E）测试，用于在真实浏览器环境中测试 Hugo 主题组件。

## 前置要求

1. **安装依赖**
   ```bash
   cd packages/hugo
   pnpm install
   ```

2. **安装 Playwright 浏览器**
   ```bash
   pnpm exec playwright install
   ```

3. **启动 Hugo 开发服务器**
   ```bash
   cd ../../hugo-theme-paper
   hugo server
   ```
   确保服务器运行在 `http://localhost:1313`

## 运行测试

### 基本命令

```bash
# 运行所有 E2E 测试
pnpm test:e2e

# 使用 UI 模式运行（推荐用于调试）
pnpm test:e2e:ui

# 有头模式运行（显示浏览器窗口）
pnpm test:e2e:headed

# 调试模式运行
pnpm test:e2e:debug
```

### 运行特定测试

```bash
# 运行特定测试文件
pnpm test:e2e theme-toggle.spec.ts

# 运行特定测试用例
pnpm test:e2e -g "用户点击主题切换按钮"

# 只在 Chromium 中运行
pnpm test:e2e --project=chromium
```

### 自定义配置

```bash
# 使用自定义 baseURL
BASE_URL=http://localhost:8080 pnpm test:e2e

# 在 CI 环境中运行
CI=true pnpm test:e2e
```

## 测试覆盖场景

### theme-toggle.spec.ts

测试主题切换功能的完整流程：

1. **基本切换** - 用户点击按钮在 light/dark 之间切换
2. **持久化** - 刷新页面后主题保持不变
3. **系统主题跟随** - 响应系统主题变化
4. **跨页面一致性** - 导航到不同页面时主题保持一致
5. **防闪烁机制** - 页面加载时无主题闪烁
6. **键盘访问性** - 使用 Tab + Enter 切换主题
7. **可访问性属性** - 验证 ARIA 属性正确设置
8. **三态切换** - light → dark → system 循环
9. **并发切换** - 快速点击不会导致状态错误

## 测试架构

### 浏览器支持

测试在以下浏览器中运行：
- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

### 测试策略

- **完全并行** - 所有测试并行运行以提高速度
- **自动重试** - 本地开发时失败测试自动重试一次
- **智能等待** - 使用 Playwright 的自动等待机制，避免 `sleep()`
- **截图和视频** - 失败时自动保存截图和视频

## 调试技巧

### 使用 UI 模式

```bash
pnpm test:e2e:ui
```

UI 模式提供：
- 可视化测试执行
- 时间旅行调试
- DOM 快照查看
- 网络请求监控

### 使用调试模式

```bash
pnpm test:e2e:debug
```

调试模式会：
- 打开浏览器开发者工具
- 在每个操作前暂停
- 允许单步执行测试

### 查看测试报告

```bash
# 运行测试后查看 HTML 报告
pnpm exec playwright show-report
```

## 编写新测试

### 测试模板

```typescript
import { test, expect } from '@playwright/test';

test.describe('功能名称', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 设置测试前置条件
  });

  test('测试场景描述', async ({ page }) => {
    // 1. 定位元素
    const element = page.locator('[data-testid="element"]');
    
    // 2. 执行操作
    await element.click();
    
    // 3. 验证结果
    await expect(element).toHaveAttribute('data-state', 'active');
  });
});
```

### 最佳实践

1. **使用 data 属性定位元素**
   ```typescript
   // 推荐
   page.locator('[data-theme-toggle]')
   
   // 避免
   page.locator('.theme-toggle-button')
   ```

2. **使用 Playwright 的自动等待**
   ```typescript
   // 推荐
   await expect(element).toBeVisible();
   
   // 避免
   await page.waitForTimeout(1000);
   ```

3. **清理测试状态**
   ```typescript
   test.beforeEach(async ({ page }) => {
     await page.evaluate(() => localStorage.clear());
   });
   ```

4. **测试隔离**
   - 每个测试应该独立运行
   - 不依赖其他测试的执行顺序
   - 在 `beforeEach` 中设置初始状态

## 故障排查

### 测试超时

如果测试超时，检查：
1. Hugo 服务器是否正在运行
2. baseURL 是否正确配置
3. 网络连接是否正常

### 元素未找到

如果找不到元素：
1. 检查选择器是否正确
2. 使用 `page.pause()` 暂停并检查页面状态
3. 检查元素是否在 iframe 中

### 测试不稳定

如果测试时而通过时而失败：
1. 避免使用固定的 `waitForTimeout`
2. 使用 `waitForLoadState` 等待页面加载
3. 使用 `expect` 的自动重试机制

## CI/CD 集成

### GitHub Actions 示例

```yaml
- name: Install Playwright Browsers
  run: pnpm exec playwright install --with-deps

- name: Start Hugo Server
  run: |
    cd hugo-theme-paper
    hugo server &
    sleep 5

- name: Run E2E Tests
  run: pnpm test:e2e
  env:
    CI: true

- name: Upload Test Report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: packages/hugo/playwright-report/
```

## 参考资源

- [Playwright 官方文档](https://playwright.dev)
- [Playwright 最佳实践](https://playwright.dev/docs/best-practices)
- [Playwright API 参考](https://playwright.dev/docs/api/class-playwright)
