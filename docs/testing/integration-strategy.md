# 集成测试策略

> **版本**: 1.0.0  
> **最后更新**: 2026-05-12  
> **维护者**: Sisyphus (AI Agent)

## 概述

本文档定义了 @ouraihub/ui-library 的集成测试策略，确保：
- 跨包集成正常工作
- 框架适配器（Hugo/Astro）正确包装核心功能
- 端到端用户场景验证

---

## 测试金字塔

```
        /\
       /  \
      / E2E \          10% - 端到端测试（真实浏览器）
     /______\
    /        \
   /  集成测试 \       30% - 跨包集成测试
  /____________\
 /              \
/    单元测试     \     60% - 单元测试（纯函数、类）
/________________\
```

**原则**：
- 单元测试覆盖核心逻辑（60%）
- 集成测试验证包协作（30%）
- E2E 测试验证关键用户流程（10%）

---

## 集成测试分类

### 1. 跨包集成测试

**目标**：验证包之间的依赖关系和数据流

**测试场景**：
```typescript
// packages/hugo/__tests__/integration/theme-toggle.test.ts

import { ThemeManager } from '@ouraihub/core';
import { HugoThemeToggle } from '@ouraihub/hugo';

describe('Hugo Theme Toggle Integration', () => {
  it('should sync with ThemeManager', () => {
    const manager = new ThemeManager();
    const toggle = new HugoThemeToggle({ manager });
    
    toggle.setTheme('dark');
    
    expect(manager.getCurrentTheme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
  
  it('should persist theme across page loads', () => {
    const manager = new ThemeManager({ persist: true });
    manager.setTheme('dark');
    
    const newManager = new ThemeManager({ persist: true });
    
    expect(newManager.getCurrentTheme()).toBe('dark');
  });
});
```

---

### 2. 框架适配器测试

**目标**：验证 Hugo/Astro 适配器正确包装核心功能

#### Hugo 适配器测试

```typescript
// packages/hugo/__tests__/integration/hugo-adapter.test.ts

import { renderHugoPartial } from '@ouraihub/hugo';
import { ThemeManager } from '@ouraihub/core';

describe('Hugo Adapter Integration', () => {
  it('should render theme toggle partial', () => {
    const html = renderHugoPartial('theme-toggle', {
      defaultTheme: 'light',
      showLabel: true
    });
    
    expect(html).toContain('data-theme-toggle');
    expect(html).toContain('aria-label');
  });
  
  it('should inject anti-flicker script', () => {
    const html = renderHugoPartial('anti-flicker');
    
    expect(html).toContain('<script>');
    expect(html).toContain('localStorage.getItem');
    expect(html).not.toContain('undefined');
  });
});
```

#### Astro 适配器测试

```typescript
// packages/astro/__tests__/integration/astro-adapter.test.ts

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ThemeToggle from '@ouraihub/astro/components/ThemeToggle.astro';

describe('Astro Adapter Integration', () => {
  it('should render ThemeToggle component', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ThemeToggle, {
      props: { defaultTheme: 'light' }
    });
    
    expect(result).toContain('data-theme-toggle');
  });
  
  it('should pass props to core ThemeManager', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ThemeToggle, {
      props: { 
        defaultTheme: 'dark',
        persist: false 
      }
    });
    
    expect(result).toContain('data-default-theme="dark"');
  });
});
```

---

### 3. 样式系统集成测试

**目标**：验证 Design Tokens 与组件的集成

```typescript
// packages/core/__tests__/integration/tokens-integration.test.ts

import '@ouraihub/tokens/tokens.css';
import { ThemeManager } from '@ouraihub/core';

describe('Tokens Integration', () => {
  beforeEach(() => {
    document.head.innerHTML = '<style>@import "@ouraihub/tokens/tokens.css";</style>';
  });
  
  it('should apply CSS variables on theme change', () => {
    const manager = new ThemeManager();
    manager.setTheme('dark');
    
    const bgColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-bg-primary');
    
    expect(bgColor).toBeTruthy();
  });
  
  it('should support custom token overrides', () => {
    document.documentElement.style.setProperty('--color-accent', '#ff0000');
    
    const accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-accent');
    
    expect(accentColor).toBe('#ff0000');
  });
});
```

---

### 4. 端到端场景测试

**目标**：验证完整用户流程

```typescript
// e2e/theme-switching.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Theme Switching E2E', () => {
  test('should switch theme and persist', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    await page.click('[data-theme-toggle]');
    
    const theme = await page.getAttribute('html', 'data-theme');
    expect(theme).toBe('dark');
    
    await page.reload();
    
    const persistedTheme = await page.getAttribute('html', 'data-theme');
    expect(persistedTheme).toBe('dark');
  });
  
  test('should respect system preference', async ({ page, context }) => {
    await context.emulateMedia({ colorScheme: 'dark' });
    await page.goto('http://localhost:3000');
    
    const theme = await page.getAttribute('html', 'data-theme');
    expect(theme).toBe('dark');
  });
  
  test('should not flicker on page load', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const screenshots: string[] = [];
    
    page.on('load', async () => {
      for (let i = 0; i < 5; i++) {
        screenshots.push(await page.screenshot({ encoding: 'base64' }));
        await page.waitForTimeout(50);
      }
    });
    
    await page.reload();
    
    const uniqueScreenshots = new Set(screenshots);
    expect(uniqueScreenshots.size).toBe(1);
  });
});
```

---

## 测试环境配置

### 集成测试环境

```typescript
// vitest.integration.config.ts

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'integration',
    environment: 'jsdom',
    setupFiles: ['./test/integration-setup.ts'],
    include: ['**/__tests__/integration/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 30000
  }
});
```

### E2E 测试环境

```typescript
// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  
  webServer: {
    command: 'pnpm --filter example-hugo dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

---

## 测试数据管理

### Fixtures

```typescript
// test/fixtures/theme-manager.fixture.ts

import { ThemeManager } from '@ouraihub/core';

export function createThemeManagerFixture(overrides = {}) {
  return new ThemeManager({
    defaultTheme: 'light',
    persist: false,
    ...overrides
  });
}

export function createDOMFixture() {
  document.body.innerHTML = `
    <div id="app">
      <button data-theme-toggle>Toggle</button>
      <div data-theme-indicator></div>
    </div>
  `;
  
  return {
    toggle: document.querySelector('[data-theme-toggle]') as HTMLButtonElement,
    indicator: document.querySelector('[data-theme-indicator]') as HTMLDivElement,
    cleanup: () => {
      document.body.innerHTML = '';
    }
  };
}
```

### Mock 数据

```typescript
// test/mocks/localStorage.mock.ts

export function mockLocalStorage() {
  const store = new Map<string, string>();
  
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => store.set(key, value)),
    removeItem: vi.fn((key: string) => store.delete(key)),
    clear: vi.fn(() => store.clear()),
    get size() {
      return store.size;
    }
  };
}
```

---

## 测试覆盖率目标

### 包级别覆盖率

| 包 | 单元测试 | 集成测试 | E2E 测试 | 总覆盖率 |
|---|---|---|---|---|
| @ouraihub/core | 90% | 80% | - | 85%+ |
| @ouraihub/tokens | - | 70% | - | 70%+ |
| @ouraihub/hugo | 80% | 80% | 60% | 75%+ |
| @ouraihub/astro | 80% | 80% | 60% | 75%+ |
| @ouraihub/utils | 95% | - | - | 95%+ |

### 关键路径覆盖率

**必须 100% 覆盖**：
- 主题切换逻辑
- localStorage 持久化
- 防闪烁脚本
- 系统主题检测

---

## CI/CD 集成

### GitHub Actions 工作流

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build packages
        run: pnpm build
      
      - name: Run integration tests
        run: pnpm test:integration
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/integration/coverage-final.json
          flags: integration

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright
        run: pnpm exec playwright install --with-deps
      
      - name: Build packages
        run: pnpm build
      
      - name: Run E2E tests
        run: pnpm test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 测试命令

### 本地开发

```bash
pnpm test:unit          # 单元测试
pnpm test:integration   # 集成测试
pnpm test:e2e           # E2E 测试
pnpm test:all           # 所有测试

pnpm test:watch         # 监听模式
pnpm test:coverage      # 覆盖率报告
```

### CI 环境

```bash
pnpm test:ci            # CI 模式（无监听、生成覆盖率）
```

---

## 测试最佳实践

### 1. 测试隔离

每个测试应该独立，不依赖其他测试的状态：

```typescript
beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
  vi.clearAllMocks();
});
```

### 2. 测试命名

使用描述性的测试名称：

```typescript
it('should persist theme to localStorage when persist option is true', () => {
  // ...
});
```

### 3. 测试覆盖边界情况

```typescript
describe('ThemeManager edge cases', () => {
  it('should handle invalid theme values', () => {
    const manager = new ThemeManager();
    expect(() => manager.setTheme('invalid' as any)).toThrow();
  });
  
  it('should handle localStorage quota exceeded', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    
    const manager = new ThemeManager({ persist: true });
    expect(() => manager.setTheme('dark')).not.toThrow();
  });
});
```

### 4. 异步测试

```typescript
it('should wait for theme transition', async () => {
  const manager = new ThemeManager();
  
  await manager.setTheme('dark');
  await vi.waitFor(() => {
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
```

---

## 相关文档

- [错误处理策略](../guides/error-handling.md) - 错误处理测试
- [包依赖关系图](../architecture/03-package-dependencies.md) - 包集成关系
- [实施路线图](../implementation/01-roadmap.md) - 测试任务规划

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-12
