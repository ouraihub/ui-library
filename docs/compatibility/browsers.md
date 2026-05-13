# 浏览器兼容性

> **版本**: 1.4.0  
> **最后更新**: 2026-05-12  
> **状态**: active  
> **维护者**: Sisyphus (AI Agent)

本文档定义 `@ouraihub/ui-library` 的浏览器支持策略、兼容性矩阵、polyfill 方案和降级策略。

---

## 目录

- [支持策略](#支持策略)
- [浏览器兼容性矩阵](#浏览器兼容性矩阵)
- [功能检测](#功能检测)
- [Polyfill 策略](#polyfill-策略)
- [降级方案](#降级方案)
- [测试策略](#测试策略)

---

## 支持策略

### 目标浏览器

我们遵循 **现代浏览器优先** 策略，支持最近两个主要版本的现代浏览器。

#### 支持级别

| 级别 | 描述 | 浏览器 |
|------|------|--------|
| **完全支持** | 所有功能正常工作 | Chrome 120+, Firefox 120+, Safari 17+, Edge 120+ |
| **基本支持** | 核心功能可用，部分高级特性降级 | Chrome 100+, Firefox 100+, Safari 15+, Edge 100+ |
| **不支持** | 不保证功能正常 | IE 11, 旧版浏览器 |

### Browserslist 配置

```json
{
  "browserslist": [
    "last 2 Chrome versions",
    "last 2 Firefox versions",
    "last 2 Safari versions",
    "last 2 Edge versions",
    "not dead",
    "not IE 11"
  ]
}
```

---

## 浏览器兼容性矩阵

### 桌面浏览器

| 功能 | Chrome | Firefox | Safari | Edge | 备注 |
|------|--------|---------|--------|------|------|
| **核心功能** |
| 主题切换 | ✅ 120+ | ✅ 120+ | ✅ 17+ | ✅ 120+ | 完全支持 |
| localStorage | ✅ 120+ | ✅ 120+ | ✅ 17+ | ✅ 120+ | 完全支持 |
| CSS 变量 | ✅ 120+ | ✅ 120+ | ✅ 17+ | ✅ 120+ | 完全支持 |
| **高级功能** |
| Intersection Observer | ✅ 120+ | ✅ 120+ | ✅ 17+ | ✅ 120+ | 懒加载必需 |
| ResizeObserver | ✅ 120+ | ✅ 120+ | ✅ 17+ | ✅ 120+ | 响应式布局 |
| matchMedia | ✅ 120+ | ✅ 120+ | ✅ 17+ | ✅ 120+ | 系统主题检测 |
| Web Crypto API | ✅ 120+ | ✅ 120+ | ✅ 17+ | ✅ 120+ | 数据加密 |
| **CSS 功能** |
| CSS Grid | ✅ 120+ | ✅ 120+ | ✅ 17+ | ✅ 120+ | 布局 |
| CSS Flexbox | ✅ 120+ | ✅ 120+ | ✅ 17+ | ✅ 120+ | 布局 |
| CSS Container Queries | ✅ 120+ | ✅ 120+ | ✅ 17+ | ✅ 120+ | 响应式组件 |
| CSS :has() | ✅ 120+ | ✅ 121+ | ✅ 17+ | ✅ 120+ | 高级选择器 |
| **JavaScript 功能** |
| ES2022 | ✅ 120+ | ✅ 120+ | ✅ 17+ | ✅ 120+ | 现代语法 |
| Optional Chaining | ✅ 120+ | ✅ 120+ | ✅ 17+ | ✅ 120+ | `?.` 操作符 |
| Nullish Coalescing | ✅ 120+ | ✅ 120+ | ✅ 17+ | ✅ 120+ | `??` 操作符 |
| Private Fields | ✅ 120+ | ✅ 120+ | ✅ 17+ | ✅ 120+ | `#field` |

### 移动浏览器

| 功能 | iOS Safari | Chrome Android | Samsung Internet | 备注 |
|------|------------|----------------|------------------|------|
| **核心功能** |
| 主题切换 | ✅ 17+ | ✅ 120+ | ✅ 23+ | 完全支持 |
| 触摸事件 | ✅ 17+ | ✅ 120+ | ✅ 23+ | 完全支持 |
| 视口单位 | ✅ 17+ | ✅ 120+ | ✅ 23+ | `dvh`, `svh` |
| **高级功能** |
| Intersection Observer | ✅ 17+ | ✅ 120+ | ✅ 23+ | 懒加载 |
| Service Worker | ✅ 17+ | ✅ 120+ | ✅ 23+ | PWA 支持 |
| Web Share API | ✅ 17+ | ✅ 120+ | ✅ 23+ | 原生分享 |

### 图例

- ✅ **完全支持** - 功能正常工作
- ⚠️ **部分支持** - 需要 polyfill 或降级
- ❌ **不支持** - 功能不可用
- 🔧 **需要配置** - 需要额外配置

---

## 功能检测

### 特性检测工具

```typescript
/**
 * 浏览器特性检测
 */
export class FeatureDetection {
  /**
   * 检测 localStorage 支持
   */
  static hasLocalStorage(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 检测 Intersection Observer 支持
   */
  static hasIntersectionObserver(): boolean {
    return 'IntersectionObserver' in window;
  }

  /**
   * 检测 ResizeObserver 支持
   */
  static hasResizeObserver(): boolean {
    return 'ResizeObserver' in window;
  }

  /**
   * 检测 matchMedia 支持
   */
  static hasMatchMedia(): boolean {
    return 'matchMedia' in window;
  }

  /**
   * 检测 CSS 变量支持
   */
  static hasCSSVariables(): boolean {
    return window.CSS && window.CSS.supports('color', 'var(--test)');
  }

  /**
   * 检测触摸支持
   */
  static hasTouchSupport(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    );
  }

  /**
   * 检测 Web Crypto API 支持
   */
  static hasWebCrypto(): boolean {
    return 'crypto' in window && 'subtle' in window.crypto;
  }

  /**
   * 检测 Container Queries 支持
   */
  static hasContainerQueries(): boolean {
    return window.CSS && window.CSS.supports('container-type', 'inline-size');
  }

  /**
   * 获取所有特性支持情况
   */
  static getFeatureSupport(): FeatureSupport {
    return {
      localStorage: this.hasLocalStorage(),
      intersectionObserver: this.hasIntersectionObserver(),
      resizeObserver: this.hasResizeObserver(),
      matchMedia: this.hasMatchMedia(),
      cssVariables: this.hasCSSVariables(),
      touchSupport: this.hasTouchSupport(),
      webCrypto: this.hasWebCrypto(),
      containerQueries: this.hasContainerQueries(),
    };
  }
}

interface FeatureSupport {
  localStorage: boolean;
  intersectionObserver: boolean;
  resizeObserver: boolean;
  matchMedia: boolean;
  cssVariables: boolean;
  touchSupport: boolean;
  webCrypto: boolean;
  containerQueries: boolean;
}
```

### 使用示例

```typescript
import { FeatureDetection } from '@ouraihub/core/utils/feature-detection';

// 检测单个特性
if (FeatureDetection.hasIntersectionObserver()) {
  // 使用 Intersection Observer
  const loader = new LazyLoader();
} else {
  // 降级方案：立即加载所有图片
  loadAllImages();
}

// 获取完整报告
const support = FeatureDetection.getFeatureSupport();
console.log('Feature Support:', support);
```

---

## Polyfill 策略

### 按需加载 Polyfill

使用动态导入按需加载 polyfill：

```typescript
/**
 * Polyfill 加载器
 */
export class PolyfillLoader {
  private static loaded = new Set<string>();

  /**
   * 加载 Intersection Observer polyfill
   */
  static async loadIntersectionObserver(): Promise<void> {
    if (FeatureDetection.hasIntersectionObserver()) {
      return;
    }

    if (this.loaded.has('intersection-observer')) {
      return;
    }

    await import('intersection-observer');
    this.loaded.add('intersection-observer');
  }

  /**
   * 加载 ResizeObserver polyfill
   */
  static async loadResizeObserver(): Promise<void> {
    if (FeatureDetection.hasResizeObserver()) {
      return;
    }

    if (this.loaded.has('resize-observer')) {
      return;
    }

    await import('@juggle/resize-observer');
    this.loaded.add('resize-observer');
  }

  /**
   * 加载所有必需的 polyfill
   */
  static async loadAll(): Promise<void> {
    await Promise.all([
      this.loadIntersectionObserver(),
      this.loadResizeObserver(),
    ]);
  }
}
```

### 使用 Polyfill

```typescript
import { PolyfillLoader } from '@ouraihub/core/utils/polyfill-loader';

// 在应用初始化时加载
async function init() {
  await PolyfillLoader.loadAll();
  
  // 现在可以安全使用这些 API
  const loader = new LazyLoader();
}
```

### 推荐的 Polyfill 包

| API | Polyfill 包 | 大小 | 备注 |
|-----|------------|------|------|
| Intersection Observer | `intersection-observer` | ~6KB | 懒加载必需 |
| ResizeObserver | `@juggle/resize-observer` | ~4KB | 响应式组件 |
| Web Crypto API | `@peculiar/webcrypto` | ~100KB | 仅在需要时加载 |
| CSS Variables | 不推荐 | - | 使用降级方案 |

---

## 降级方案

### 1. localStorage 降级

```typescript
/**
 * 带降级的存储管理器
 */
export class StorageManager {
  private memoryStorage = new Map<string, string>();
  private useMemory = !FeatureDetection.hasLocalStorage();

  getItem(key: string): string | null {
    if (this.useMemory) {
      return this.memoryStorage.get(key) || null;
    }
    return localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    if (this.useMemory) {
      this.memoryStorage.set(key, value);
      return;
    }
    localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    if (this.useMemory) {
      this.memoryStorage.delete(key);
      return;
    }
    localStorage.removeItem(key);
  }
}
```

### 2. Intersection Observer 降级

```typescript
/**
 * 带降级的懒加载
 */
export class LazyLoader {
  private observer?: IntersectionObserver;
  private useFallback = !FeatureDetection.hasIntersectionObserver();

  constructor(options: LazyLoaderOptions = {}) {
    if (this.useFallback) {
      // 降级方案：立即加载所有图片
      this.loadAllImmediately();
    } else {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        options
      );
    }
  }

  observe(element: HTMLImageElement): void {
    if (this.useFallback) {
      this.loadImage(element);
    } else {
      this.observer?.observe(element);
    }
  }

  private loadAllImmediately(): void {
    console.warn('IntersectionObserver not supported, loading all images immediately');
  }
}
```

### 3. CSS 变量降级

```css
/* 使用 CSS 变量 */
.theme-toggle {
  color: var(--ui-text, #1a1a1a); /* 提供降级值 */
  background: var(--ui-background, #ffffff);
}

/* 或使用 PostCSS 插件自动生成降级 */
/* postcss.config.js */
module.exports = {
  plugins: [
    require('postcss-custom-properties')({
      preserve: true, // 保留原始变量
    }),
  ],
};
```

### 4. matchMedia 降级

```typescript
/**
 * 带降级的媒体查询检测
 */
export class MediaQueryDetector {
  static matches(query: string): boolean {
    if (!FeatureDetection.hasMatchMedia()) {
      // 降级方案：假设是桌面环境
      console.warn('matchMedia not supported, assuming desktop');
      return query.includes('min-width');
    }
    
    return window.matchMedia(query).matches;
  }

  static watchMedia(
    query: string,
    callback: (matches: boolean) => void
  ): () => void {
    if (!FeatureDetection.hasMatchMedia()) {
      // 降级方案：立即调用一次
      callback(this.matches(query));
      return () => {};
    }

    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    
    mql.addEventListener('change', handler);
    
    return () => mql.removeEventListener('change', handler);
  }
}
```

### 5. 系统主题检测降级

```typescript
/**
 * 带降级的系统主题检测
 */
export class SystemThemeDetector {
  static getPreferredTheme(): 'light' | 'dark' {
    if (!FeatureDetection.hasMatchMedia()) {
      // 降级方案：默认 light
      return 'light';
    }

    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    return darkQuery.matches ? 'dark' : 'light';
  }

  static watchThemeChange(
    callback: (theme: 'light' | 'dark') => void
  ): () => void {
    if (!FeatureDetection.hasMatchMedia()) {
      // 降级方案：不监听变化
      return () => {};
    }

    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      callback(e.matches ? 'dark' : 'light');
    };

    darkQuery.addEventListener('change', handler);
    
    return () => darkQuery.removeEventListener('change', handler);
  }
}
```

---

## 测试策略

### 跨浏览器测试

#### 本地测试

使用 Playwright 进行跨浏览器测试：

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
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
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
```

#### CI 测试

```yaml
# .github/workflows/browser-tests.yml
name: Browser Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps ${{ matrix.browser }}
      - run: pnpm test:e2e --project=${{ matrix.browser }}
```

### BrowserStack 集成

对于真实设备测试，使用 BrowserStack：

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    connectOptions: {
      wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
        JSON.stringify({
          browser: 'chrome',
          browser_version: 'latest',
          os: 'Windows',
          os_version: '11',
          name: 'UI Library Tests',
        })
      )}`,
    },
  },
});
```

### 兼容性测试清单

- [ ] 所有目标浏览器的最新版本
- [ ] 所有目标浏览器的前一个主要版本
- [ ] 移动设备（iOS Safari, Chrome Android）
- [ ] 不同屏幕尺寸（320px - 2560px）
- [ ] 触摸和鼠标交互
- [ ] 键盘导航
- [ ] 屏幕阅读器（NVDA, JAWS, VoiceOver）

---

## 浏览器特定问题

### Safari 特定问题

#### 1. 日期格式

```typescript
// ❌ Safari 不支持
new Date('2026-05-12');

// ✅ 使用 ISO 格式
new Date('2026-05-12T00:00:00Z');
```

#### 2. 100vh 问题

```css
/* ❌ 移动端 Safari 地址栏会影响 */
.modal {
  height: 100vh;
}

/* ✅ 使用动态视口单位 */
.modal {
  height: 100dvh; /* 动态视口高度 */
  height: 100vh; /* 降级 */
}
```

#### 3. Flexbox 问题

```css
/* ❌ Safari 需要明确的 flex-shrink */
.item {
  flex: 1;
}

/* ✅ 明确所有值 */
.item {
  flex: 1 1 auto;
}
```

### Firefox 特定问题

#### 1. Scrollbar 样式

```css
/* Firefox 使用不同的属性 */
.scrollable {
  scrollbar-width: thin;
  scrollbar-color: var(--thumb) var(--track);
}

/* Webkit 浏览器 */
.scrollable::-webkit-scrollbar {
  width: 8px;
}
```

### Chrome 特定问题

#### 1. 自动填充样式

```css
/* 覆盖 Chrome 自动填充的黄色背景 */
input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px white inset;
  -webkit-text-fill-color: var(--ui-text);
}
```

---

## 性能优化

### 条件加载

```typescript
/**
 * 根据浏览器能力条件加载功能
 */
export async function loadOptionalFeatures() {
  const support = FeatureDetection.getFeatureSupport();

  // 只在支持的浏览器加载高级功能
  if (support.intersectionObserver) {
    const { LazyLoader } = await import('./lazy-loader');
    new LazyLoader().observeAll();
  }

  if (support.resizeObserver) {
    const { ResponsiveManager } = await import('./responsive-manager');
    new ResponsiveManager().init();
  }
}
```

### 代码分割

```typescript
// 使用动态导入按需加载
async function enableAdvancedFeatures() {
  if (FeatureDetection.hasWebCrypto()) {
    const { DataEncryption } = await import('./encryption');
    // 使用加密功能
  }
}
```

---

## 相关文档

- [测试策略](../testing/README.md) - 跨浏览器测试方法
- [性能优化](../guides/performance.md) - 性能优化策略
- [API 参考](../api/README.md) - 核心 API 文档
- [部署指南](../deployment/README.md) - 生产环境配置

---

## 浏览器支持资源

- [Can I Use](https://caniuse.com/) - 浏览器特性支持查询
- [MDN Browser Compatibility](https://developer.mozilla.org/en-US/docs/Web/API) - API 兼容性文档
- [Browserslist](https://browsersl.ist/) - 浏览器列表查询
- [Polyfill.io](https://polyfill.io/) - 自动 polyfill 服务

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-12
