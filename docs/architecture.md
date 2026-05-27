# @ouraihub/ui-library 架构设计

## 定位

为多框架（Hugo/Astro/React/Vue）博客主题提供**可复用的核心逻辑和设计令牌**，让主题开发者专注于 UI 和配置，不重复实现通用功能。

## 设计原则

1. **Core 无 DOM 渲染** — 纯逻辑层，返回数据或操作 DOM，不生成 HTML 结构
2. **框架包只做薄包装** — 调用 core，用各框架语法渲染，不含业务逻辑
3. **主题只做配置和编排** — 决定用什么、放在哪、长什么样
4. **向下兼容** — core 的 API 变更不破坏已有主题

## 包结构

```
@ouraihub/
├── tokens        # 设计令牌（CSS 变量、颜色、间距、字体）
├── core          # 核心逻辑（纯 TS，无框架依赖）
├── astro         # Astro 组件包装
├── hugo          # Hugo partial 包装
├── preset-blog   # 博客预设（Content Collection schema 等）
└── preset-docs   # 文档站预设
```

## 各包职责与边界

### @ouraihub/tokens

**职责：** 设计令牌定义，所有视觉一致性的源头。

**包含：**
- CSS 变量定义（颜色、间距、圆角、阴影、字体）
- Light/Dark 主题变量
- Tailwind CSS preset（`@ouraihub/tokens/preset`）

**不包含：**
- 任何组件
- 任何 JS 逻辑

**边界：** 只输出 CSS，任何框架都能 `@import '@ouraihub/tokens/css'` 直接用。

---

### @ouraihub/core

**职责：** 跨框架通用的纯逻辑层。

**包含：**

| 模块 | API | 说明 |
|------|-----|------|
| `theme` | `ThemeManager.init()` / `.toggle()` / `.get()` | 主题切换（localStorage + data-theme） |
| `seo` | `SEOManager.generateMeta()` / `.generateSchema()` | SEO 元数据生成 |
| `share` | `getShareLinks(url, title)` → `{name, href}[]` | 社交分享链接生成 |
| `comments` | `initComments(provider, config, el)` | 评论系统初始化（Giscus/Twikoo/Waline） |
| `comments` | `syncCommentTheme(provider, theme)` | 评论主题跟随切换 |
| `code-copy` | `initCodeCopy(selector?)` | 代码块复制按钮注入 |
| `back-to-top` | `initBackToTop(threshold?, el?)` | 返回顶部按钮逻辑 |
| `search` | `initPagefind(inputEl, resultEl)` | Pagefind 搜索初始化 |
| `icons` | `ICONS: Record<string, string>` | SVG path 常量集合 |
| `i18n` | `createI18n(translations)` → `t(key, locale)` | 轻量 i18n 工具 |
| `analytics` | `initAnalytics(provider, id)` | Google Analytics / Umami / Plausible |

**不包含：**
- HTML/模板渲染
- 框架特定语法（.astro / Go template / JSX）
- 配置文件解析（那是主题的事）
- 样式/CSS

**边界：** 所有函数要么返回数据（纯函数），要么操作已有 DOM 元素（副作用函数）。绝不创建 HTML 结构。

**示例：**

```ts
// core/share.ts
export function getShareLinks(url: string, title: string): ShareLink[] {
  return [
    { name: 'Twitter', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, icon: 'twitter' },
    { name: 'Facebook', href: `https://www.facebook.com/sharer.php?u=${encodeURIComponent(url)}`, icon: 'facebook' },
    // ...
  ];
}

// core/comments.ts
export function initComments(provider: 'giscus' | 'twikoo' | 'waline', config: CommentConfig, el: HTMLElement): void {
  // 注入 script 标签到 el
}

export function syncCommentTheme(provider: string, theme: 'light' | 'dark'): void {
  // 给 iframe postMessage
}
```

---

### @ouraihub/astro

**职责：** 用 Astro 语法包装 core 的功能，提供开箱即用的 `.astro` 组件。

**包含：**

| 组件 | 调用 core 的 | 输出 |
|------|-------------|------|
| `<SEO />` | `SEOManager` | `<meta>` 标签 |
| `<ShareLinks />` | `getShareLinks()` + `ICONS` | 分享按钮列表 |
| `<Comments />` | `initComments()` | 评论容器 + 初始化脚本 |
| `<Icon />` | `ICONS` | SVG 元素 |
| `<CodeCopy />` | `initCodeCopy()` | 注入脚本 |
| `<BackToTop />` | `initBackToTop()` | 按钮 + 脚本 |
| `<Search />` | `initPagefind()` | 搜索框 + 结果容器 |
| `<ThemeToggle />` | `ThemeManager` | 切换按钮 |

**不包含：**
- 业务逻辑（全在 core 里）
- 配置解析（主题传 props）
- 页面布局

**边界：** 每个组件只做两件事：① 渲染 HTML 结构 ② 调用 core 的初始化函数。

---

### @ouraihub/hugo

**职责：** 同 astro 包，但用 Hugo Go 模板语法。

**包含：**
- `layouts/partials/ouraihub/share-links.html`
- `layouts/partials/ouraihub/comments.html`
- `layouts/partials/ouraihub/back-to-top.html`
- `assets/ts/ouraihub.ts`（调用 core 的 JS bundle）

---

### @ouraihub/preset-blog

**职责：** 博客场景的预设配置。

**包含：**
- Content Collection schema（title/date/tags/summary/cover/draft）
- 推荐的 Markdown 插件列表
- 推荐的 Shiki 主题配置

**不包含：**
- 组件
- 页面

---

## 主题的职责（不属于 ui-library）

| 职责 | 说明 |
|------|------|
| 配置格式 | `site.config.yaml` / `hugo.toml` 的结构定义 |
| 页面编排 | 评论放文章底部、分享放标题下方等 |
| 布局 | Header/Footer/Sidebar 的结构 |
| 样式定制 | 在 tokens 基础上覆盖颜色、间距 |
| 路由 | URL 结构（`/articles/slug` vs `/blog/slug`） |
| i18n 翻译文本 | 具体的中英文文案 |
| 部署配置 | workflow、平台适配 |

---

## 依赖关系

```
主题（msgflow-site / hugo-theme-paper）
  ├── @ouraihub/astro 或 @ouraihub/hugo
  │     └── @ouraihub/core
  └── @ouraihub/tokens
```

主题不直接依赖 core（通过框架包间接使用），但可以直接 import core 的工具函数。

---

## 版本策略

| 包 | 发版频率 | 破坏性变更 |
|---|---------|-----------|
| tokens | 低（设计系统稳定后很少改） | 新增变量不破坏，删除/重命名需 major |
| core | 中（新增功能） | 函数签名变更需 major |
| astro/hugo | 跟随 core | Props 变更需 major |
| preset-* | 低 | schema 变更需 major |

---

## 迁移路径（当前 → 理想状态）

1. **Phase 1（当前）：** 逻辑写在主题里，ui-library 只有 tokens + 基础 core
2. **Phase 2：** 把 share/comments/code-copy/back-to-top 的逻辑抽到 core
3. **Phase 3：** astro 包提供完整组件，主题只做配置传递
4. **Phase 4：** hugo 包对齐 astro 包的功能，两个主题共享同一套 core

当前处于 Phase 1，主题功能稳定后再逐步下沉到 ui-library。

---

## Svelte/SvelteKit 支持规划

### 背景

现有 SvelteKit 项目：
- `nullclaw.io` — NullClaw 运行时文档站
- `nullhub.io` — NullHub 生态文档站（多产品）
- 未来 ouraihub 产品站也可能用 SvelteKit

两个现有项目是 copy-paste 的同一套模板（DocSidebar、DocsLayout、TableOfContents、markdown.ts、app.css），需要抽取共享。

### 新增包

```
@ouraihub/
├── ... (已有)
├── svelte          # Svelte 组件包装（对应 astro/hugo 包）
└── preset-docs-svelte  # SvelteKit 文档站预设模板
```

### @ouraihub/svelte

**职责：** 用 Svelte 语法包装 core 的功能。

| 组件 | 调用 core | 说明 |
|------|----------|------|
| `<ThemeToggle />` | ThemeManager | 主题切换按钮 |
| `<TableOfContents />` | TOCHighlighter | 目录滚动高亮 |
| `<CodeCopy />` | CodeCopyManager | 代码复制按钮 |
| `<BackToTop />` | BackToTop | 返回顶部 |
| `<ShareLinks />` | ShareManager | 社交分享 |
| `<Comments />` | CommentManager | 评论系统 |
| `<Icon />` | @ouraihub/icons | SVG 图标 |
| `<Search />` | SearchAdapter | 搜索 |

### @ouraihub/preset-docs-svelte

**职责：** SvelteKit 文档站的完整预设模板（从 nullclaw.io/nullhub.io 提取）。

**包含：**
- `DocsLayout.svelte` — 文档页布局（侧边栏 + 内容 + TOC）
- `DocSidebar.svelte` — 文档导航侧边栏
- `markdown.ts` — Markdown 渲染（marked + highlight.js + DOMPurify）
- `app.css` — 文档站基础样式（多主题 CSS 变量）
- 路由模板（`/docs/[slug]`）

**使用方式：**
```bash
# 新建文档站
npx degit ouraihub/preset-docs-svelte my-docs
cd my-docs && pnpm install

# 只需要：
# 1. 在 src/lib/docs/ 放 Markdown 文件
# 2. 改 app.css 里的配色
# 3. pnpm run build
```

### 从现有项目提取的逻辑

| 现有代码 | 去向 |
|---------|------|
| `TableOfContents.svelte` 的 IntersectionObserver | `@ouraihub/core` TOCHighlighter |
| `markdown.ts` 的 slugify | `@ouraihub/utils` slugify |
| `app.css` 的 CSS 变量系统 | `@ouraihub/tokens`（映射层） |
| `DocSidebar` + `DocsLayout` | `@ouraihub/preset-docs-svelte` |

### 实施优先级

| 顺序 | 内容 | 依赖 |
|------|------|------|
| 1 | core TOCHighlighter 完成 | Phase 2 Batch 3 |
| 2 | `@ouraihub/svelte` 基础组件 | core 完成 |
| 3 | `@ouraihub/preset-docs-svelte` 模板 | svelte 包完成 |
| 4 | nullclaw.io / nullhub.io 迁移 | 模板完成 |

### 与 Hugo/Astro 的关系

```
                    @ouraihub/core（纯逻辑）
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
  @ouraihub/hugo   @ouraihub/astro  @ouraihub/svelte
         │               │               │
         ▼               ▼               ▼
  hugo-theme-*     msgflow-site     nullclaw.io
                                    nullhub.io
                                    ouraihub 产品站
```

三个框架包地位平等，都是 core 的薄包装。新增 Svelte 支持不影响已有的 Hugo/Astro 包。
