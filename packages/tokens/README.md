# @ouraihub/tokens

> 设计令牌和 Tailwind CSS 预设

[![npm version](https://img.shields.io/npm/v/@ouraihub/tokens.svg)](https://www.npmjs.com/package/@ouraihub/tokens)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 简介

`@ouraihub/tokens` 提供统一的设计令牌（颜色、间距、字体、阴影等）和 Tailwind CSS 预设，确保所有项目使用一致的设计系统。

### 特性

- 🎨 **统一设计** - 所有项目共享相同的设计令牌
- 🌗 **暗色主题** - 内置 light/dark 主题支持
- 🔧 **Tailwind 集成** - 开箱即用的 Tailwind 预设
- 📦 **零依赖** - 纯 CSS 变量，无运行时依赖
- ⚡ **轻量级** - < 5KB (gzipped)
- 🎯 **类型安全** - TypeScript 类型定义

## 安装

```bash
# npm
npm install @ouraihub/tokens

# pnpm
pnpm add @ouraihub/tokens

# yarn
yarn add @ouraihub/tokens
```

## 快速开始

### 使用 CSS 变量

```css
/* 导入设计令牌 */
@import '@ouraihub/tokens/css';

/* 使用 CSS 变量 */
.button {
  background: var(--ui-primary);
  color: var(--ui-text);
  padding: var(--ui-spacing-md);
  border-radius: var(--ui-radius-md);
  box-shadow: var(--ui-shadow-sm);
}
```

### 使用 Tailwind 预设

```javascript
// tailwind.config.js
import preset from '@ouraihub/tokens/preset';

export default {
  presets: [preset],
  content: [
    './src/**/*.{html,js,ts,jsx,tsx,astro}',
  ],
};
```

使用 Tailwind 工具类：

```html
<button class="bg-ui-primary text-ui-text px-ui-md py-ui-sm rounded-ui-md shadow-ui-sm">
  点击我
</button>
```

## 设计令牌

### 颜色系统

```css
:root {
  /* 文本颜色 */
  --ui-text: #1a1a1a;
  --ui-text-secondary: #666666;
  --ui-text-muted: #999999;
  
  /* 背景颜色 */
  --ui-background: #ffffff;
  --ui-background-secondary: #f5f5f5;
  --ui-background-tertiary: #e5e5e5;
  
  /* 边框颜色 */
  --ui-border: #e0e0e0;
  --ui-border-hover: #cccccc;
  
  /* 品牌颜色 */
  --ui-primary: #2937f0;
  --ui-primary-hover: #1e28c0;
  
  /* 语义颜色 */
  --ui-success: #10b981;
  --ui-warning: #f59e0b;
  --ui-error: #ef4444;
  --ui-info: #3b82f6;
}

[data-theme="dark"] {
  --ui-text: #e5e5e5;
  --ui-text-secondary: #a3a3a3;
  --ui-text-muted: #737373;
  
  --ui-background: #1a1a1a;
  --ui-background-secondary: #262626;
  --ui-background-tertiary: #404040;
  
  --ui-border: #404040;
  --ui-border-hover: #525252;
  
  --ui-primary: #4f5ff5;
  --ui-primary-hover: #6b7aff;
}
```

### 间距系统

```css
:root {
  --ui-spacing-xs: 4px;
  --ui-spacing-sm: 8px;
  --ui-spacing-md: 16px;
  --ui-spacing-lg: 24px;
  --ui-spacing-xl: 32px;
  --ui-spacing-2xl: 48px;
  --ui-spacing-3xl: 64px;
}
```

### 字体系统

```css
:root {
  /* 字体族 */
  --ui-font-sans: system-ui, -apple-system, sans-serif;
  --ui-font-mono: 'Fira Code', 'Consolas', monospace;
  
  /* 字体大小 */
  --ui-text-xs: 0.75rem;    /* 12px */
  --ui-text-sm: 0.875rem;   /* 14px */
  --ui-text-base: 1rem;     /* 16px */
  --ui-text-lg: 1.125rem;   /* 18px */
  --ui-text-xl: 1.25rem;    /* 20px */
  --ui-text-2xl: 1.5rem;    /* 24px */
  --ui-text-3xl: 1.875rem;  /* 30px */
  --ui-text-4xl: 2.25rem;   /* 36px */
  
  /* 字重 */
  --ui-font-normal: 400;
  --ui-font-medium: 500;
  --ui-font-semibold: 600;
  --ui-font-bold: 700;
  
  /* 行高 */
  --ui-leading-tight: 1.25;
  --ui-leading-normal: 1.5;
  --ui-leading-relaxed: 1.75;
}
```

### 圆角系统

```css
:root {
  --ui-radius-sm: 4px;
  --ui-radius-md: 6px;
  --ui-radius-lg: 8px;
  --ui-radius-xl: 12px;
  --ui-radius-2xl: 16px;
  --ui-radius-full: 9999px;
}
```

### 阴影系统

```css
:root {
  --ui-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --ui-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --ui-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --ui-shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
}

[data-theme="dark"] {
  --ui-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --ui-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --ui-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  --ui-shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.6);
}
```

## Tailwind 预设

预设包含所有设计令牌的 Tailwind 工具类：

### 颜色工具类

```html
<!-- 文本颜色 -->
<p class="text-ui-text">主要文本</p>
<p class="text-ui-text-secondary">次要文本</p>
<p class="text-ui-text-muted">弱化文本</p>

<!-- 背景颜色 -->
<div class="bg-ui-background">主背景</div>
<div class="bg-ui-background-secondary">次背景</div>

<!-- 品牌颜色 -->
<button class="bg-ui-primary hover:bg-ui-primary-hover">按钮</button>

<!-- 语义颜色 -->
<div class="text-ui-success">成功</div>
<div class="text-ui-error">错误</div>
```

### 间距工具类

```html
<!-- Padding -->
<div class="p-ui-md">16px padding</div>
<div class="px-ui-lg py-ui-sm">24px 水平, 8px 垂直</div>

<!-- Margin -->
<div class="m-ui-xl">32px margin</div>
<div class="mt-ui-2xl mb-ui-lg">48px 上, 24px 下</div>

<!-- Gap -->
<div class="flex gap-ui-md">16px gap</div>
```

### 圆角工具类

```html
<div class="rounded-ui-sm">4px 圆角</div>
<div class="rounded-ui-md">6px 圆角</div>
<div class="rounded-ui-lg">8px 圆角</div>
<button class="rounded-ui-full">完全圆角</button>
```

### 阴影工具类

```html
<div class="shadow-ui-sm">小阴影</div>
<div class="shadow-ui-md">中阴影</div>
<div class="shadow-ui-lg">大阴影</div>
```

## TypeScript 支持

```typescript
import { tokens } from '@ouraihub/tokens';

// 访问设计令牌
console.log(tokens.colors.primary);
console.log(tokens.spacing.md);
console.log(tokens.radius.md);
```

类型定义：

```typescript
interface DesignTokens {
  colors: {
    text: string;
    textSecondary: string;
    background: string;
    primary: string;
    // ...
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    // ...
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    // ...
  };
  // ...
}
```

## 自定义主题

### 覆盖 CSS 变量

```css
/* 自定义品牌颜色 */
:root {
  --ui-primary: #ff6b6b;
  --ui-primary-hover: #ff5252;
}

/* 自定义暗色主题 */
[data-theme="dark"] {
  --ui-background: #0a0a0a;
  --ui-text: #f0f0f0;
}
```

### 扩展 Tailwind 预设

```javascript
// tailwind.config.js
import preset from '@ouraihub/tokens/preset';

export default {
  presets: [preset],
  theme: {
    extend: {
      colors: {
        brand: '#ff6b6b',
      },
    },
  },
};
```

## 使用场景

### Hugo 主题

```html
<!-- layouts/_default/baseof.html -->
<head>
  <link rel="stylesheet" href="/css/tokens.css">
</head>

<body data-theme="light">
  <div class="bg-ui-background text-ui-text">
    <!-- 内容 -->
  </div>
</body>
```

### Astro 项目

```astro
---
// src/layouts/Layout.astro
import '@ouraihub/tokens/css';
---

<html data-theme="light">
  <body class="bg-ui-background text-ui-text">
    <slot />
  </body>
</html>
```

## 相关包

- [@ouraihub/core](../core) - 核心逻辑层
- [@ouraihub/hugo](../hugo) - Hugo 组件包装
- [@ouraihub/utils](../utils) - 工具函数库

## 文档

- [完整文档](../../docs/README.md)
- [设计系统](../../docs/DESIGN.md)
- [架构决策](../../docs/decisions/003-css-variables-over-css-in-js.md)

## 许可证

MIT
