# Hugo 自定义样式示例

展示如何自定义主题切换按钮的样式和行为。

## 功能特性

- ✅ 自定义按钮样式
- ✅ 自定义图标
- ✅ 自定义动画效果
- ✅ 响应式设计

## 文件结构

```
custom-styling/
├── README.md
├── layouts/
│   └── partials/
│       └── theme-toggle-custom.html
└── assets/
    ├── css/
    │   └── theme-toggle-custom.css
    └── ts/
        └── theme-custom.ts
```

## 快速开始

### 步骤 1: 复制文件

将以下文件复制到你的项目：

1. `layouts/partials/theme-toggle-custom.html`
2. `assets/css/theme-toggle-custom.css`
3. `assets/ts/theme-custom.ts`

### 步骤 2: 在模板中使用

```html
<nav>
  {{ partial "theme-toggle-custom.html" . }}
</nav>
```

### 步骤 3: 自定义样式

修改 `theme-toggle-custom.css` 中的 CSS 变量：

```css
:root {
  --theme-toggle-size: 2.5rem;
  --theme-toggle-bg: #ffffff;
  --theme-toggle-border: #e0e0e0;
  --theme-toggle-hover-bg: #f5f5f5;
}
```

## 自定义选项

### 1. 修改按钮尺寸

```css
.theme-toggle-custom {
  width: 3rem;
  height: 3rem;
  font-size: 1.5rem;
}
```

### 2. 修改动画效果

```css
.theme-toggle-custom {
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.theme-toggle-custom:active {
  transform: rotate(180deg) scale(0.9);
}
```

### 3. 使用自定义图标

替换 HTML 中的图标：

```html
<span class="theme-icon-light">
  <svg><!-- 你的 SVG 图标 --></svg>
</span>
```

## 预期效果

- 按钮带圆角和阴影
- 悬停时有缩放效果
- 点击时有旋转动画
- 响应式适配移动端

## 许可证

MIT
