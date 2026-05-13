# @ouraihub/hugo

Hugo 主题组件包，提供开箱即用的主题切换功能。

## 安装

```bash
pnpm add @ouraihub/hugo @ouraihub/core
```

## 使用方式

### 1. 在 Hugo 模板中引入 partial

在你的 Hugo 布局文件中（如 `layouts/partials/header.html`）：

```html
{{ partial "theme-toggle.html" . }}
```

### 2. 在 Hugo 配置中引入 JS 脚本

在 `config.toml` 或 `config.yaml` 中配置静态资源：

```toml
# config.toml
[outputs]
  home = ["HTML", "JSON"]

[params]
  # 其他配置...
```

在你的基础模板（`layouts/_default/baseof.html`）中引入脚本：

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 其他 head 内容 -->
</head>
<body>
  {{ block "main" . }}{{ end }}
  
  <!-- 在 body 末尾引入主题初始化脚本 -->
  <script src="/js/theme-init.js"></script>
</body>
</html>
```

### 3. 配置 CSS 变量

在你的全局样式中定义主题相关的 CSS 变量：

```css
:root {
  --ui-border: #e0e0e0;
  --ui-background: #ffffff;
  --ui-background-hover: #f5f5f5;
}

[data-theme="dark"] {
  --ui-border: #333333;
  --ui-background: #1a1a1a;
  --ui-background-hover: #2a2a2a;
}
```

## 配置选项

主题切换按钮支持以下自定义属性：

| 属性 | 默认值 | 说明 |
|------|--------|------|
| `data-ui-storage-key` | `theme` | localStorage 存储键名 |
| `data-ui-attribute` | `data-theme` | 应用主题的 HTML 属性名 |
| `aria-label` | `切换主题` | 无障碍标签 |

### 自定义示例

如果需要自定义存储键或属性名，可以修改 partial：

```html
<button 
  data-ui-component="theme-toggle"
  data-ui-storage-key="my-theme"
  data-ui-attribute="data-color-scheme"
  class="theme-toggle-btn"
  aria-label="切换主题"
>
  <span class="theme-icon-light">☀️</span>
  <span class="theme-icon-dark">🌙</span>
</button>
```

## 工作原理

### ThemeManager 类

核心逻辑由 `ThemeManager` 类提供，支持三种主题模式：

- **light**: 浅色主题
- **dark**: 深色主题
- **system**: 跟随系统设置（默认）

### 自动初始化

`theme-init.js` 脚本会在 DOM 加载完成后自动：

1. 扫描所有 `[data-ui-component="theme-toggle"]` 元素
2. 为每个元素创建 `ThemeManager` 实例
3. 绑定点击事件以切换主题
4. 监听系统主题变化

### 持久化

用户选择的主题会自动保存到 localStorage，下次访问时自动恢复。

## 样式定制

主题切换按钮使用 CSS 变量，可以通过修改 `theme-toggle.html` 中的样式来自定义外观：

```css
.theme-toggle-btn {
  /* 自定义按钮样式 */
  border: 1px solid var(--ui-border, #e0e0e0);
  background: var(--ui-background, #ffffff);
  padding: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
}
```

## 无障碍支持

- 按钮包含 `aria-label` 属性，屏幕阅读器可以正确识别
- 支持键盘导航（Tab 键）
- 支持 Enter/Space 键激活

## 浏览器兼容性

- Chrome/Edge: ✅ 完全支持
- Firefox: ✅ 完全支持
- Safari: ✅ 完全支持（iOS 13+）
- IE 11: ⚠️ 需要 polyfill

## 许可证

MIT
