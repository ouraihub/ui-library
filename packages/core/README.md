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
