# 共享模块拆分规划

## 现状

```
ui-library (monorepo)
├── packages/core          ← 纯 TS 逻辑（ThemeManager, SEOManager 等）
├── packages/tokens        ← CSS 变量
├── packages/icons         ← SVG 图标
├── packages/astro         ← Astro 组件
├── packages/svelte        ← Svelte 组件
├── packages/ai-chat       ← AI Chat
├── packages/hugo          ← ❌ Hugo 模板（不属于 npm 生态）
├── packages/preset-blog   ← ❌ Hugo 博客预设（同上）
├── packages/preset-docs   ← ❌ Hugo 文档预设（同上）
├── packages/theme-bridge  ← ❌ Hugo 主题桥接（同上）
└── packages/utils         ← 工具函数
```

**问题：**
1. Hugo 模板放在 npm monorepo 里，分发方式不匹配
2. 四个 Hugo 主题各自重复实现相同功能
3. Hugo 主题依赖 workspace 包，无法独立使用

## 目标架构

```
┌─────────────────────────────────────────────────────┐
│                  npm 生态（ui-library）                │
│                                                     │
│  @ouraihub/core     纯 TS 逻辑，无框架绑定           │
│  @ouraihub/tokens   CSS 变量 / 设计 token            │
│  @ouraihub/icons    SVG 图标                         │
│  @ouraihub/astro    Astro 组件                       │
│  @ouraihub/svelte   Svelte 组件                      │
│  @ouraihub/ai-chat  AI Chat 组件                     │
│  @ouraihub/utils    工具函数                          │
└──────────────────────────┬──────────────────────────┘
                           │ npm install
                           ▼
                    msgflow-site (Astro)

┌─────────────────────────────────────────────────────┐
│              Hugo 生态（hugo-shared-modules）          │
│                                                     │
│  partials/seo/       SEO meta + schema + robots      │
│  partials/comments/  Giscus / Waline / Twikoo        │
│  partials/ui/        share-links, pagination, etc    │
│  assets/ts/          内联 TS（从 core 复制，独立维护） │
│  assets/css/         chroma 双主题 + 公共样式         │
└──────────────────────────┬──────────────────────────┘
                           │ hugo mod get
                           ▼
              hugo-theme-paper / butterfly / fluid / hugowind
```

## ui-library 瘦身方案

### 保留

| 包 | 职责 |
|---|---|
| `@ouraihub/core` | ThemeManager, createLogger, 纯 TS 工具 |
| `@ouraihub/tokens` | CSS 变量、颜色、间距 |
| `@ouraihub/icons` | SVG 图标集 |
| `@ouraihub/astro` | Astro 组件（SEO.astro 等） |
| `@ouraihub/svelte` | Svelte 组件 |
| `@ouraihub/ai-chat` | AI Chat 组件 |
| `@ouraihub/utils` | 通用工具函数 |

### 移除

| 包 | 去向 |
|---|---|
| `packages/hugo` | → hugo-shared-modules |
| `packages/preset-blog` | → hugo-shared-modules |
| `packages/preset-docs` | → hugo-shared-modules |
| `packages/theme-bridge` | → 删除 |

## hugo-shared-modules 结构

```
github.com/ouraihub-hugo-themes/hugo-shared-modules
├── go.mod
├── partials/
│   ├── seo/
│   │   ├── meta.html              ← OG, Twitter, description, robots
│   │   ├── schema-article.html    ← Article + author + publisher
│   │   ├── schema-breadcrumb.html
│   │   ├── schema-faq.html        ← 从 frontmatter.faq 自动生成
│   │   ├── schema-website.html
│   │   └── hreflang.html
│   ├── comments/
│   │   ├── giscus.html
│   │   ├── waline.html
│   │   ├── twikoo.html
│   │   └── comments.html          ← 统一入口
│   ├── ui/
│   │   ├── share-links.html       ← 可配置
│   │   ├── pagination.html
│   │   ├── back-to-top.html
│   │   ├── language-switcher.html
│   │   └── reading-time.html
│   └── head/
│       ├── favicon.html
│       └── fonts.html
├── assets/
│   ├── ts/
│   │   ├── theme-manager.ts
│   │   ├── code-copy.ts
│   │   ├── back-to-top.ts
│   │   ├── reading-progress.ts
│   │   ├── heading-links.ts
│   │   └── search-modal.ts
│   └── css/
│       ├── chroma-light.css
│       └── chroma-dark.css
└── layouts/
    └── robots.txt
```

## TS 同步策略

`@ouraihub/core`（npm）和 `hugo-shared-modules/assets/ts/`（内联）代码相同但独立维护。

- core 有重大更新时手动同步
- hugo 侧可以简化（博客不需要所有功能）
- 不做自动同步

## 执行计划

| 阶段 | 时间 | 内容 |
|------|------|------|
| 1 | 现在 | paper 修复 @ouraihub/core 依赖（内联） |
| 2 | 1 周内 | 创建 hugo-shared-modules，从 paper 提取 |
| 3 | 2 周内 | paper 迁移到 shared-modules |
| 4 | 3 周内 | ui-library 瘦身（删 hugo/preset-blog/preset-docs/theme-bridge） |
| 5 | 1-2 月 | 其他主题逐个迁移 |

## 不做的事

- ❌ 不把 Hugo 模板发布到 npm
- ❌ 不让 Hugo 主题运行时依赖 npm 包
- ❌ 不做 core 和 hugo-shared-modules 的自动同步
- ❌ 不在 shared-modules 中放主题特有的样式
