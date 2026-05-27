# 基于 @ouraihub/ui-library 开发新主题指南

## 适用场景

当你要开发一个新的 Hugo 或 Astro 博客/站点主题时，按本指南的分工方式，可以最大化复用 ui-library 的能力，只写主题特有的部分。

---

## 分工原则

```
你只需要关心：
  ✅ 视觉设计（配色、排版、间距、动画）
  ✅ 页面布局（Header/Footer/Sidebar 的 HTML 结构）
  ✅ 配置格式（hugo.toml / site.config.yaml）
  ✅ 路由结构（URL 设计）
  ✅ 主题特色功能（差异化卖点）

你不需要重复写：
  ❌ 主题切换逻辑
  ❌ 代码复制按钮
  ❌ 返回顶部
  ❌ 评论系统集成
  ❌ 社交分享链接
  ❌ SEO 元数据生成
  ❌ 搜索适配
  ❌ 图标 SVG
  ❌ i18n URL 工具
  ❌ 键盘快捷键
```

---

## Hugo 主题开发流程

### 1. 初始化项目

```bash
mkdir hugo-theme-xxx && cd hugo-theme-xxx
hugo new theme .
```

### 2. 引入 ui-library

```bash
# go.mod 添加 Hugo Module（用于 hugo partial）
hugo mod get github.com/ouraihub/ui-library/packages/hugo

# package.json 添加（用于 JS/CSS 构建）
pnpm add @ouraihub/core @ouraihub/tokens @ouraihub/icons
```

### 3. 创建映射层

```css
/* assets/css/ouraihub-mapping.css */
@import '@ouraihub/tokens/css';

:root, html[data-theme="light"] {
  /* 将 @ouraihub/tokens 映射到你的主题变量 */
  --background: var(--ui-background);
  --foreground: var(--ui-text);
  --accent: var(--ui-primary);
  /* 或者覆盖为你自己的配色 */
  --accent: #your-brand-color;
}

html[data-theme="dark"] {
  --background: #your-dark-bg;
  --foreground: #your-dark-text;
  --accent: #your-dark-accent;
}
```

### 4. 使用 Hugo partials

```html
<!-- layouts/_default/single.html -->
{{ define "main" }}
<article>
  {{ .Content }}
</article>

<!-- 评论：一行搞定 -->
{{ partial "ouraihub/comments.html" . }}

<!-- 分享：一行搞定 -->
{{ partial "ouraihub/share-links.html" . }}

<!-- 返回顶部：一行搞定 -->
{{ partial "ouraihub/back-to-top.html" . }}
{{ end }}
```

### 5. 使用 core JS

```typescript
// assets/ts/main.ts
import { ThemeManager } from '@ouraihub/core/theme';
import { CodeCopyManager } from '@ouraihub/core/code-copy';
import { BackToTop } from '@ouraihub/core/back-to-top';
import { KeyboardShortcuts } from '@ouraihub/core/keyboard-shortcuts';

// 初始化（一次性，所有主题通用）
ThemeManager.init({ attribute: 'data-theme' });
new CodeCopyManager().init();
new BackToTop({ threshold: 0.3 }).init();

// 你的主题特有逻辑
// ...
```

### 6. 你只需要写的

```
layouts/
├── _default/
│   ├── baseof.html      ← 你的 HTML 骨架
│   ├── single.html      ← 文章页布局
│   └── list.html        ← 列表页布局
├── partials/
│   ├── header.html      ← 你的导航设计
│   ├── footer.html      ← 你的页脚设计
│   ├── post-card.html   ← 你的文章卡片样式
│   └── sidebar.html     ← 你的侧边栏（如果有）
assets/
├── css/
│   ├── main.css         ← Tailwind 入口 + 你的自定义样式
│   └── ouraihub-mapping.css ← 映射层
└── ts/
    └── main.ts          ← import core + 你的特有逻辑
```

---

## Astro 主题开发流程

### 1. 初始化项目

```bash
pnpm create astro -- --template minimal
```

### 2. 引入 ui-library

```bash
pnpm add @ouraihub/core @ouraihub/astro @ouraihub/tokens @ouraihub/icons
```

### 3. 使用 Astro 组件

```astro
---
// src/pages/articles/[slug].astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import { ShareLinks, Comments, CodeCopy, BackToTop } from '@ouraihub/astro';
---

<BaseLayout>
  <article class="prose">
    <Content />
  </article>

  <!-- 一行一个功能 -->
  <ShareLinks url={Astro.url.href} title={title} />
  <Comments config={commentsConfig} />
  <CodeCopy />
  <BackToTop />
</BaseLayout>
```

### 4. 配置映射

```css
/* src/styles/global.css */
@import "tailwindcss";
@import "@ouraihub/tokens/css";

/* 覆盖为你的主题配色 */
:root {
  --ui-primary: #your-brand-color;
}
```

### 5. 你只需要写的

```
src/
├── layouts/
│   └── BaseLayout.astro    ← 你的 HTML 骨架
├── components/
│   ├── Header.astro        ← 你的导航设计
│   ├── Footer.astro        ← 你的页脚设计
│   └── PostCard.astro      ← 你的文章卡片样式
├── pages/                  ← 你的路由结构
├── styles/
│   └── global.css          ← Tailwind + 配色覆盖
├── content/                ← Content Collections
└── site.config.yaml        ← 用户配置（如果你要做）
```

---

## 新主题 Checklist

开发新主题时，按这个清单检查分工是否正确：

### ✅ 应该用 ui-library 的

- [ ] 主题切换 → `ThemeManager`
- [ ] 代码复制 → `CodeCopyManager`
- [ ] 返回顶部 → `BackToTop`
- [ ] 社交分享 → `ShareManager` / `<ShareLinks />`
- [ ] 评论系统 → `CommentManager` / `<Comments />`
- [ ] SEO 元数据 → `SEOManager` / `<SEO />`
- [ ] 图标 → `@ouraihub/icons`
- [ ] 设计令牌 → `@ouraihub/tokens`
- [ ] 工具函数 → `@ouraihub/utils`（debounce/throttle/qs）

### ✅ 按需用 ui-library 的

- [ ] TOC 高亮 → `TOCHighlighter`（如果有目录功能）
- [ ] 阅读进度 → `ReadingProgress`（如果有进度条）
- [ ] 键盘快捷键 → `KeyboardShortcuts`（如果有快捷键）
- [ ] 搜索 → `SearchAdapter`（如果有搜索）
- [ ] 标题锚点 → `HeadingLinks`（如果要自动加 #）
- [ ] 多媒体嵌入 → `getEmbedUrl()`（如果支持 shortcode）
- [ ] i18n URL → `getLocalizedUrl()`（如果多语言）
- [ ] 懒加载 → `LazyLoader`（如果有大量图片/内容）

### ❌ 必须自己写的

- [ ] HTML 布局结构（Header/Footer/Sidebar）
- [ ] 视觉风格（配色、字体、圆角、阴影）
- [ ] 响应式布局（断点、移动端菜单）
- [ ] 页面路由（URL 结构）
- [ ] 文章卡片/列表样式
- [ ] 动画效果（入场、过渡、hover）
- [ ] 主题特色功能（差异化卖点）
- [ ] 配置格式（hugo.toml / yaml / ts）
- [ ] 代码高亮配置（Shiki/Chroma 主题选择）

---

## Hugo vs Astro 选型建议

| 维度 | 选 Hugo | 选 Astro |
|------|---------|---------|
| 构建速度 | ⭐⭐⭐⭐⭐（毫秒级） | ⭐⭐⭐（秒级） |
| 生态 | 成熟，主题多 | 新兴，增长快 |
| 交互能力 | 弱（需要额外 JS） | 强（Islands 架构） |
| 学习曲线 | Go 模板语法 | 类 JSX，前端友好 |
| 适合场景 | 纯内容站、文档站 | 需要交互的博客、应用型站点 |
| TypeScript | 不支持模板层 | 全栈 TS |
| 组件复用 | partial（弱） | 组件（强） |

**建议：**
- 纯博客/文档 → Hugo（构建快，部署简单）
- 需要搜索/评论/动态内容 → Astro（Islands 架构更优雅）
- 企业站/Landing Page → Astro（组件化开发效率高）

---

## 命名规范建议

| 类型 | Hugo 主题 | Astro 主题 |
|------|-----------|-----------|
| 仓库名 | `hugo-theme-{name}` | `astro-theme-{name}` 或 `{name}-astro` |
| npm 包 | 不需要 | 可选发布到 npm |
| 配色文件 | `assets/css/ouraihub-mapping.css` | `src/styles/tokens.css` |
| 入口 JS | `assets/ts/main.ts` | 各组件内 `<script>` |
| 配置 | `config/_default/params.toml` | `site.config.yaml` |
