# Hugo 基础主题切换示例

最简单的主题切换实现，5 分钟快速上手。

## 功能特性

- ✅ Light/Dark 双主题切换
- ✅ 自动同步系统主题
- ✅ localStorage 持久化
- ✅ 防闪烁机制
- ✅ 平滑过渡动画

## 文件结构

```
basic-theme-toggle/
├── README.md                    # 本文件
├── layouts/
│   ├── partials/
│   │   └── theme-toggle.html   # 主题切换按钮
│   └── _default/
│       └── baseof.html         # 基础模板
├── assets/
│   └── ts/
│       └── theme.ts            # 主题管理逻辑
└── config.toml                 # Hugo 配置示例
```

## 快速开始

### 步骤 1: 安装依赖

```bash
# 在你的 Hugo 项目根目录
npm install @ouraihub/ui-library
```

### 步骤 2: 复制文件

将以下文件复制到你的 Hugo 项目：

1. `layouts/partials/theme-toggle.html` → 你的项目 `layouts/partials/`
2. `assets/ts/theme.ts` → 你的项目 `assets/ts/`
3. `layouts/_default/baseof.html` → 你的项目 `layouts/_default/`（或修改现有文件）

### 步骤 3: 在模板中使用

在你的 `baseof.html` 或任何布局文件中添加：

```html
<!-- 在 <head> 中添加防闪烁脚本 -->
<head>
  {{ partial "theme-toggle.html" . }}
</head>

<!-- 在导航栏或任何位置添加切换按钮 -->
<nav>
  <button data-ui-component="theme-toggle">
    <span class="theme-icon-light">☀️</span>
    <span class="theme-icon-dark">🌙</span>
  </button>
</nav>
```

### 步骤 4: 运行项目

```bash
hugo server
```

打开浏览器访问 `http://localhost:1313`，点击主题切换按钮查看效果。

## 代码说明

### 1. 主题切换按钮 (`theme-toggle.html`)

```html
<button 
  data-ui-component="theme-toggle"
  data-ui-storage-key="theme"
  data-ui-attribute="data-theme"
  class="theme-toggle-btn"
  aria-label="切换主题"
>
  <span class="theme-icon-light">☀️</span>
  <span class="theme-icon-dark">🌙</span>
</button>
```

**关键属性**:
- `data-ui-component="theme-toggle"`: 标识这是主题切换按钮
- `data-ui-storage-key="theme"`: localStorage 存储键名
- `data-ui-attribute="data-theme"`: HTML 属性名（用于 CSS 选择器）

### 2. 主题管理逻辑 (`theme.ts`)

```typescript
import { ThemeManager } from '@ouraihub/ui-library';

// 初始化主题管理器
const themeManager = new ThemeManager();

// 监听按钮点击
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const btn = target.closest('[data-ui-component="theme-toggle"]');
  if (btn) {
    themeManager.toggle();
  }
});
```

**工作原理**:
1. 创建 `ThemeManager` 实例
2. 自动从 localStorage 加载保存的主题
3. 监听系统主题变化
4. 点击按钮时切换主题

### 3. CSS 样式

主题通过 `data-theme` 属性控制：

```css
/* Light 主题（默认） */
[data-theme="light"] {
  --background: #ffffff;
  --text: #000000;
}

/* Dark 主题 */
[data-theme="dark"] {
  --background: #1a1a1a;
  --text: #ffffff;
}

/* 使用 CSS 变量 */
body {
  background: var(--background);
  color: var(--text);
}
```

## 自定义配置

### 修改存储键名

```typescript
const themeManager = new ThemeManager(document.documentElement, {
  storageKey: 'my-theme',  // 默认: 'theme'
});
```

### 修改 HTML 属性

```typescript
const themeManager = new ThemeManager(document.documentElement, {
  attribute: 'data-color-mode',  // 默认: 'data-theme'
});
```

### 设置默认主题

```typescript
const themeManager = new ThemeManager(document.documentElement, {
  defaultTheme: 'dark',  // 默认: 'system'
});
```

## 预期效果

1. **首次访问**: 根据系统主题显示（light 或 dark）
2. **点击按钮**: 主题立即切换，带平滑过渡动画
3. **刷新页面**: 保持上次选择的主题
4. **系统主题变化**: 如果用户选择 "system" 模式，自动同步系统主题

## 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 常见问题

### Q: 页面刷新时出现闪烁？

A: 确保在 `<head>` 中尽早加载防闪烁脚本：

```html
<head>
  <script>
    // 防闪烁脚本（在任何样式之前）
    (function() {
      const theme = localStorage.getItem('theme') || 'system';
      const isDark = theme === 'dark' || 
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    })();
  </script>
  <link rel="stylesheet" href="...">
</head>
```

### Q: 按钮点击没有反应？

A: 检查以下几点：
1. 确认 `theme.ts` 已正确加载
2. 检查浏览器控制台是否有错误
3. 确认按钮有 `data-ui-component="theme-toggle"` 属性

### Q: 如何自定义按钮样式？

A: 修改 CSS 类 `.theme-toggle-btn`：

```css
.theme-toggle-btn {
  /* 你的自定义样式 */
  background: transparent;
  border: none;
  font-size: 1.5rem;
}
```

### Q: 如何添加第三个主题（如 auto）？

A: 参考 `examples/common/custom-themes.ts` 示例。

## 下一步

- 查看 [自定义样式示例](../custom-styling/) 学习更多样式定制
- 查看 [多实例使用示例](../multiple-instances/) 学习高级用法
- 阅读 [API 文档](../../../docs/api/theme-manager.md) 了解完整 API

## 许可证

MIT
