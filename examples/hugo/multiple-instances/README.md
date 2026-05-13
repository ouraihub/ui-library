# Hugo 多实例使用示例

展示如何在同一页面使用多个主题切换按钮。

## 功能特性

- ✅ 多个按钮共享同一个主题管理器
- ✅ 状态自动同步
- ✅ 事件委托机制
- ✅ 性能优化

## 文件结构

```
multiple-instances/
├── README.md
├── layouts/
│   └── _default/
│       └── baseof.html
└── assets/
    └── ts/
        └── theme-multi.ts
```

## 快速开始

### 步骤 1: 在多个位置添加按钮

```html
<header>
  <button data-ui-component="theme-toggle">
    <span class="theme-icon-light">☀️</span>
    <span class="theme-icon-dark">🌙</span>
  </button>
</header>

<aside>
  <button data-ui-component="theme-toggle">
    <span class="theme-icon-light">☀️</span>
    <span class="theme-icon-dark">🌙</span>
  </button>
</aside>

<footer>
  <button data-ui-component="theme-toggle">
    <span class="theme-icon-light">☀️</span>
    <span class="theme-icon-dark">🌙</span>
  </button>
</footer>
```

### 步骤 2: 初始化主题管理器

```typescript
import { ThemeManager } from '@ouraihub/ui-library';

const themeManager = new ThemeManager();

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const btn = target.closest('[data-ui-component="theme-toggle"]');
  if (btn) {
    themeManager.toggle();
  }
});
```

## 工作原理

1. 使用事件委托，只绑定一个事件监听器
2. 所有按钮共享同一个 `ThemeManager` 实例
3. 主题变化时，所有按钮自动更新

## 性能优化

- 使用事件委托，避免多个事件监听器
- 单例模式，只创建一个主题管理器
- CSS 类切换，避免重复 DOM 操作

## 预期效果

点击任何一个按钮，所有按钮的状态都会同步更新。

## 许可证

MIT
