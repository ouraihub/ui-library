# @ouraihub/core

> 核心逻辑层 - 纯 TypeScript 类，100% 跨框架复用

[![npm version](https://img.shields.io/npm/v/@ouraihub/core.svg)](https://www.npmjs.com/package/@ouraihub/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 简介

`@ouraihub/core` 是 UI 组件库的核心逻辑层，提供纯 TypeScript 类实现，可在任何框架中使用（Hugo、Astro、React、Vue 等）。

### 特性

- 🎯 **框架无关** - 纯 TypeScript，无框架依赖
- 🔒 **类型安全** - 100% TypeScript 覆盖，strict 模式
- 🧪 **测试完善** - 90%+ 测试覆盖率
- 📦 **零依赖** - 无外部运行时依赖
- ⚡ **轻量级** - < 10KB (gzipped)
- 🌳 **Tree-shakable** - 支持按需导入

## 安装

```bash
# npm
npm install @ouraihub/core

# pnpm
pnpm add @ouraihub/core

# yarn
yarn add @ouraihub/core
```

## 快速开始

### ThemeManager - 主题切换

```typescript
import { ThemeManager } from '@ouraihub/core/theme';

// 创建主题管理器
const theme = new ThemeManager({
  storageKey: 'theme',
  attribute: 'data-theme',
  defaultTheme: 'system'
});

// 设置主题
theme.setTheme('dark');

// 切换主题
theme.toggle();

// 获取当前主题
const current = theme.getTheme(); // 'light' | 'dark' | 'system'

// 监听主题变化
const unsubscribe = theme.onThemeChange((newTheme) => {
  console.log('主题已切换:', newTheme);
});

// 取消监听
unsubscribe();
```

### NavigationController - 导航菜单

```typescript
import { NavigationController } from '@ouraihub/core/navigation';

// 创建导航控制器
const nav = new NavigationController(document.querySelector('nav'), {
  mobileBreakpoint: 768,
  hideOnScroll: true,
  scrollThreshold: 100
});

// 切换移动端菜单
nav.toggleMobileMenu();

// 切换下拉菜单
nav.toggleDropdown('products-menu');

// 监听菜单状态
nav.onMenuToggle((isOpen) => {
  console.log('移动端菜单:', isOpen ? '打开' : '关闭');
});
```

### LazyLoader - 懒加载

```typescript
import { LazyLoader } from '@ouraihub/core/lazyload';

// 创建懒加载实例
const loader = new LazyLoader({
  rootMargin: '50px',
  threshold: 0.1,
  fadeInDuration: 300
});

// 观察所有懒加载图片
loader.observeAll('img[data-src]');

// 观察所有懒加载背景
loader.observeAll('[data-bg]');

// 监听加载事件
const loaderWithCallbacks = new LazyLoader({
  onLoad: (element) => {
    console.log('加载成功:', element);
  },
  onError: (element, error) => {
    console.error('加载失败:', element, error);
  }
});
```

### SearchModal - 搜索模态框

```typescript
import { SearchModal } from '@ouraihub/core/search';

// 创建搜索模态框
const search = new SearchModal({
  shortcuts: ['ctrl+k', 'cmd+k'],
  debounceDelay: 300,
  placeholder: '搜索...',
  onSearch: async (query) => {
    const response = await fetch(`/api/search?q=${query}`);
    return response.json();
  },
  onSelect: (result) => {
    window.location.href = result.url;
  }
});

// 打开搜索
search.open();

// 关闭搜索
search.close();
```

### SEOManager - SEO 元数据管理

```typescript
import { SEOManager } from '@ouraihub/core/seo';

// 创建 SEO 管理器
const seo = new SEOManager({
  meta: {
    title: '我的网站',
    description: '网站描述',
    keywords: 'SEO, 网站, 优化'
  },
  openGraph: {
    type: 'website',
    siteName: '我的网站'
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mysite'
  }
});

// 设置页面信息
seo.setTitle('博客文章标题');
seo.setDescription('文章描述');
seo.setImage('https://example.com/image.jpg', 1200, 630);
seo.setCanonical('https://example.com/blog/post');

// 设置 Schema.org 数据
seo.setSchemaOrg({
  '@type': 'Article',
  headline: '文章标题',
  author: {
    '@type': 'Person',
    name: '作者名称'
  },
  datePublished: '2026-05-13'
});

// 生成标签
const metaTags = seo.generateMetaTags();
const schemaScript = seo.generateSchemaOrg();
```

### 自动初始化（推荐）

```html
<!-- HTML 标记 -->
<button data-ui-component="theme-toggle" 
        data-ui-storage-key="theme">
  切换主题
</button>

<!-- 自动初始化脚本 -->
<script type="module">
  import { ThemeManager } from '@ouraihub/core/theme';
  
  document.querySelectorAll('[data-ui-component="theme-toggle"]')
    .forEach(el => {
      new ThemeManager(el, {
        storageKey: el.dataset.uiStorageKey || 'theme'
      });
    });
</script>
```

## API 参考

### ThemeManager

主题切换系统，支持 light/dark/system 三态切换。

#### 构造函数

```typescript
new ThemeManager(element?: HTMLElement, options?: ThemeOptions)
```

**参数**:
- `element` (可选) - 关联的 DOM 元素
- `options` (可选) - 配置选项

**选项**:
```typescript
interface ThemeOptions {
  storageKey?: string;      // localStorage 键名，默认 'theme'
  attribute?: string;       // HTML 属性名，默认 'data-theme'
  defaultTheme?: ThemeMode; // 默认主题，默认 'system'
}

type ThemeMode = 'light' | 'dark' | 'system';
```

#### 方法

##### `setTheme(mode: ThemeMode): void`

设置主题模式。

```typescript
theme.setTheme('dark');
theme.setTheme('light');
theme.setTheme('system'); // 跟随系统
```

##### `getTheme(): ThemeMode`

获取当前主题模式。

```typescript
const current = theme.getTheme(); // 'light' | 'dark' | 'system'
```

##### `toggle(): void`

在 light 和 dark 之间切换（跳过 system）。

```typescript
theme.toggle(); // light → dark → light → ...
```

##### `onThemeChange(callback: (theme: string) => void): () => void`

监听主题变化，返回取消订阅函数。

```typescript
const unsubscribe = theme.onThemeChange((newTheme) => {
  console.log('主题变化:', newTheme);
  // 更新 UI
});

// 取消监听
unsubscribe();
```

#### 特性

- ✅ **持久化** - 自动保存到 localStorage
- ✅ **媒体查询** - system 模式自动跟随系统主题
- ✅ **防闪烁** - 页面加载时立即应用主题
- ✅ **事件通知** - 主题变化时通知所有订阅者
- ✅ **多实例** - 支持多个 ThemeManager 实例同步

---

### NavigationController

导航菜单控制器，提供移动端菜单切换、多级下拉菜单、滚动隐藏等功能。

#### 构造函数

```typescript
new NavigationController(element: HTMLElement, options?: NavigationOptions)
```

**参数**:
- `element` (必需) - 导航栏 DOM 元素
- `options` (可选) - 配置选项

**选项**:
```typescript
interface NavigationOptions {
  mobileBreakpoint?: number;      // 移动端断点，默认 768
  hideOnScroll?: boolean;         // 滚动时隐藏，默认 false
  scrollThreshold?: number;       // 滚动阈值，默认 100
  mobileMenuClass?: string;       // 移动端菜单类名
  dropdownActiveClass?: string;   // 下拉菜单激活类名
  hiddenClass?: string;           // 隐藏类名
  bodyLockClass?: string;         // body 锁定类名
}
```

#### 方法

- `openMobileMenu()` - 打开移动端菜单
- `closeMobileMenu()` - 关闭移动端菜单
- `toggleMobileMenu()` - 切换移动端菜单
- `openDropdown(id: string)` - 打开下拉菜单
- `closeDropdown()` - 关闭下拉菜单
- `toggleDropdown(id: string)` - 切换下拉菜单
- `getState()` - 获取当前状态
- `onMenuToggle(callback)` - 监听菜单切换
- `onDropdownToggle(callback)` - 监听下拉菜单切换
- `onScroll(callback)` - 监听滚动事件
- `destroy()` - 销毁实例

---

### LazyLoader

图片和内容懒加载控制器，使用 IntersectionObserver 实现。

#### 构造函数

```typescript
new LazyLoader(options?: LazyLoadOptions)
```

**选项**:
```typescript
interface LazyLoadOptions {
  root?: Element | null;          // 根元素，默认 null
  rootMargin?: string;            // 根边距，默认 '0px'
  threshold?: number;             // 阈值，默认 0
  placeholderClass?: string;      // 占位符类名
  loadingClass?: string;          // 加载中类名
  loadedClass?: string;           // 加载完成类名
  errorClass?: string;            // 错误类名
  retryCount?: number;            // 重试次数，默认 2
  retryDelay?: number;            // 重试延迟，默认 1000
  fadeInDuration?: number;        // 淡入时长，默认 300
  onEnter?: (element: HTMLElement) => void;
  onLoad?: (element: HTMLElement) => void;
  onError?: (element: HTMLElement, error: Error) => void;
}
```

#### 方法

- `observe(element)` - 观察单个元素
- `observeAll(selector)` - 观察所有匹配元素
- `unobserve(element)` - 停止观察元素
- `disconnect()` - 断开所有观察
- `getState(element)` - 获取元素状态

#### 支持的元素类型

- `<img data-src="...">` - 图片元素
- `<picture>` - Picture 元素
- `<div data-bg="...">` - 背景图片
- `<div data-content="...">` - 自定义内容

---

### SearchModal

搜索模态框，支持键盘快捷键、防抖搜索、焦点管理。

#### 构造函数

```typescript
new SearchModal(options?: SearchModalOptions)
```

**选项**:
```typescript
interface SearchModalOptions {
  container?: HTMLElement;        // 容器元素
  shortcuts?: string[];           // 快捷键，默认 ['ctrl+k', 'cmd+k']
  debounceDelay?: number;         // 防抖延迟，默认 300
  minSearchLength?: number;       // 最小搜索长度，默认 2
  modalClass?: string;            // 模态框类名
  placeholder?: string;           // 占位符文本
  onOpen?: () => void;
  onClose?: () => void;
  onSearch?: (query: string) => Promise<SearchResult[]> | SearchResult[];
  onSelect?: (result: SearchResult) => void;
}

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  url: string;
  type?: string;
  metadata?: Record<string, unknown>;
}
```

#### 方法

- `open()` - 打开搜索模态框
- `close()` - 关闭搜索模态框
- `toggle()` - 切换模态框状态
- `getState()` - 获取当前状态
- `destroy()` - 销毁实例

#### 键盘快捷键

- `Ctrl+K` / `Cmd+K` - 打开/关闭
- `Esc` - 关闭
- `↓` / `↑` - 选择结果
- `Enter` - 确认选择

---

### SEOManager

SEO 元数据管理系统，支持 Meta 标签、Open Graph、Twitter Card、Schema.org。

#### 构造函数

```typescript
new SEOManager(options?: SEOOptions)
```

**选项**:
```typescript
interface SEOOptions {
  meta?: MetaTags;                // 基础 meta 标签
  openGraph?: OpenGraphTags;      // Open Graph 标签
  twitter?: TwitterCardTags;      // Twitter Card 标签
  canonical?: string;             // 规范链接
  schema?: SchemaOrgData | SchemaOrgData[];  // Schema.org 数据
  hreflang?: Array<{ lang: string; url: string }>;  // 多语言链接
}

interface MetaTags {
  title?: string;
  description?: string;
  keywords?: string;
  viewport?: string;
  robots?: string;
  author?: string;
  charset?: string;
}

interface OpenGraphTags {
  title?: string;
  description?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
}

interface TwitterCardTags {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  title?: string;
  description?: string;
  image?: string;
  site?: string;
  creator?: string;
}
```

#### 方法

- `setTitle(title)` - 设置页面标题
- `setDescription(description)` - 设置页面描述
- `setImage(url, width?, height?)` - 设置分享图片
- `setCanonical(url)` - 设置规范链接
- `setOpenGraph(data)` - 设置 Open Graph 标签
- `setTwitterCard(data)` - 设置 Twitter Card 标签
- `setSchemaOrg(data)` - 设置 Schema.org 数据
- `addSchemaOrg(data)` - 添加 Schema.org 数据
- `setHreflang(links)` - 设置多语言链接
- `generateMetaTags()` - 生成 meta 标签 HTML
- `generateSchemaOrg()` - 生成 Schema.org JSON-LD
- `getMeta()` - 获取 meta 配置
- `getOpenGraph()` - 获取 Open Graph 配置
- `getTwitterCard()` - 获取 Twitter Card 配置
- `getSchemaOrg()` - 获取 Schema.org 配置
- `getCanonical()` - 获取规范链接
- `getHreflang()` - 获取多语言链接

#### 特性

- ✅ **完整 SEO 支持** - Meta、Open Graph、Twitter Card、Schema.org
- ✅ **自动同步** - 标题、描述、图片自动同步到社交媒体标签
- ✅ **XSS 防护** - 自动 HTML 转义，防止注入攻击
- ✅ **多语言支持** - Hreflang 标签支持
- ✅ **结构化数据** - Schema.org JSON-LD 支持

---

### LazyLoader

图片和内容懒加载控制器，使用 IntersectionObserver 实现。

#### 构造函数

```typescript
new LazyLoader(options?: LazyLoadOptions)
```

**选项**:
```typescript
interface LazyLoadOptions {
  root?: Element | null;          // 根元素，默认 null
  rootMargin?: string;            // 根边距，默认 '0px'
  threshold?: number;             // 阈值，默认 0
  placeholderClass?: string;      // 占位符类名
  loadingClass?: string;          // 加载中类名
  loadedClass?: string;           // 加载完成类名
  errorClass?: string;            // 错误类名
  retryCount?: number;            // 重试次数，默认 2
  retryDelay?: number;            // 重试延迟，默认 1000
  fadeInDuration?: number;        // 淡入时长，默认 300
  onEnter?: (element: HTMLElement) => void;
  onLoad?: (element: HTMLElement) => void;
  onError?: (element: HTMLElement, error: Error) => void;
}
```

#### 方法

- `observe(element)` - 观察单个元素
- `observeAll(selector)` - 观察所有匹配元素
- `unobserve(element)` - 停止观察元素
- `disconnect()` - 断开所有观察
- `getState(element)` - 获取元素状态

#### 支持的元素类型

- `<img data-src="...">` - 图片元素
- `<picture>` - Picture 元素
- `<div data-bg="...">` - 背景图片
- `<div data-content="...">` - 自定义内容

---

### SearchModal

搜索模态框，支持键盘快捷键、防抖搜索、焦点管理。

#### 构造函数

```typescript
new SearchModal(options?: SearchModalOptions)
```

**选项**:
```typescript
interface SearchModalOptions {
  container?: HTMLElement;        // 容器元素
  shortcuts?: string[];           // 快捷键，默认 ['ctrl+k', 'cmd+k']
  debounceDelay?: number;         // 防抖延迟，默认 300
  minSearchLength?: number;       // 最小搜索长度，默认 2
  modalClass?: string;            // 模态框类名
  placeholder?: string;           // 占位符文本
  onOpen?: () => void;
  onClose?: () => void;
  onSearch?: (query: string) => Promise<SearchResult[]> | SearchResult[];
  onSelect?: (result: SearchResult) => void;
}

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  url: string;
  type?: string;
  metadata?: Record<string, unknown>;
}
```

#### 方法

- `open()` - 打开搜索模态框
- `close()` - 关闭搜索模态框
- `toggle()` - 切换模态框状态
- `getState()` - 获取当前状态
- `destroy()` - 销毁实例

#### 键盘快捷键

- `Ctrl+K` / `Cmd+K` - 打开/关闭
- `Esc` - 关闭
- `↓` / `↑` - 选择结果
- `Enter` - 确认选择

## 使用场景

### Hugo 主题

```html
<!-- layouts/partials/theme-toggle.html -->
<button data-ui-component="theme-toggle" 
        class="theme-toggle">
  <span class="light-icon">☀️</span>
  <span class="dark-icon">🌙</span>
</button>

<!-- layouts/_default/baseof.html -->
<script type="module">
  import { ThemeManager } from '@ouraihub/core/theme';
  
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-ui-component="theme-toggle"]')
      .forEach(el => new ThemeManager(el));
  });
</script>
```

### Astro 组件

```astro
---
// components/ThemeToggle.astro
interface Props {
  storageKey?: string;
}

const { storageKey = 'theme' } = Astro.props;
---

<button class="theme-toggle">
  <span class="light-icon">☀️</span>
  <span class="dark-icon">🌙</span>
</button>

<script>
  import { ThemeManager } from '@ouraihub/core/theme';
  
  const button = document.currentScript?.previousElementSibling;
  if (button) {
    new ThemeManager(button as HTMLElement);
  }
</script>
```

### React 组件

```tsx
import { useEffect, useRef } from 'react';
import { ThemeManager } from '@ouraihub/core/theme';

export function ThemeToggle() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const themeRef = useRef<ThemeManager>();

  useEffect(() => {
    if (buttonRef.current) {
      themeRef.current = new ThemeManager(buttonRef.current);
    }
    
    return () => {
      // 清理
    };
  }, []);

  return (
    <button ref={buttonRef} className="theme-toggle">
      <span className="light-icon">☀️</span>
      <span className="dark-icon">🌙</span>
    </button>
  );
}
```

## 防闪烁机制

在页面 `<head>` 中添加内联脚本，在页面加载前应用主题：

```html
<head>
  <script>
    (function() {
      const theme = localStorage.getItem('theme') || 'system';
      const isDark = theme === 'dark' || 
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    })();
  </script>
</head>
```

## 浏览器兼容性

- Chrome/Edge >= 90
- Firefox >= 88
- Safari >= 14
- 需要 ES2020 支持

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# 类型检查
pnpm typecheck
```

## 相关包

- [@ouraihub/tokens](../tokens) - 设计令牌和 Tailwind 预设
- [@ouraihub/hugo](../hugo) - Hugo 组件包装
- [@ouraihub/utils](../utils) - 工具函数库

## 文档

- [完整文档](../../docs/README.md)
- [API 参考](../../docs/api/README.md)
- [架构设计](../../docs/DESIGN.md)

## 许可证

MIT
