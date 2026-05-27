# Hugo 共享模块设计文档

> 基于 paper/butterfly/fluid/hugowind 四个主题的深入代码分析。

## 定位

`packages/hugo-shared` — ui-library monorepo 中的一个包，提供 Hugo 主题通用的 partials 和 TS 模块。四个主题通过 pnpm workspace 引用。

## 目录结构

```
packages/hugo-shared/
├── package.json
├── README.md
├── layouts/partials/shared/
│   ├── seo-meta.html
│   ├── schema.html
│   ├── comments.html
│   ├── comments/
│   │   └── giscus.html
│   ├── share-links.html
│   ├── pagination.html
│   ├── back-to-top.html
│   ├── language-switcher.html
│   └── theme-toggle.html
├── assets/
│   ├── ts/
│   │   ├── theme-init.ts          ← 防闪烁（同步加载在 head）
│   │   ├── theme-manager.ts       ← ThemeManager class
│   │   ├── back-to-top.ts
│   │   ├── code-copy.ts
│   │   ├── heading-links.ts
│   │   ├── reading-progress.ts
│   │   └── comments-sync.ts       ← 评论主题同步 + 懒加载
│   └── css/
│       ├── chroma-light.css
│       └── chroma-dark.css
├── i18n/
│   ├── en.toml                     ← 共享翻译 key
│   └── zh.toml
└── config/
    └── defaults.toml               ← 默认参数值文档
```

## 统一接口设计

### 1. SEO Meta (`shared/seo-meta.html`)

**调用方式：**
```html
{{ partial "shared/seo-meta.html" . }}
```

**读取的 params：**
```toml
[params.seo]
  description = "Site description"
  author = "Author Name"
  ogImage = "/og-image.png"
  keywords = ["keyword1", "keyword2"]

  [params.seo.twitter]
    card = "summary_large_image"
    site = "@handle"

  [params.seo.robots]
    index = true
    follow = true
```

**页面级覆盖（frontmatter）：**
```yaml
description: "Page specific description"
image: "/page-cover.jpg"
author: "Page Author"
robots: "noindex"
```

**输出：** meta description, OG 全套, Twitter Card, robots, author, keywords, canonical。

---

### 2. Schema (`shared/schema.html`)

**调用方式：**
```html
{{ partial "shared/schema.html" . }}
```

**自动行为：**
- 首页 → WebSite + Organization schema
- 文章页 → BlogPosting + BreadcrumbList + (FAQPage if .Params.faq)
- 列表页 → CollectionPage
- 其他页 → WebPage

**读取的 params：**
```toml
[params.schema]
  [params.schema.organization]
    name = ""          # 默认 .Site.Title
    logo = "/logo.svg"
    
  [params.schema.author]
    name = ""          # 默认 params.seo.author
    url = ""
    image = ""

# 社交链接用于 sameAs
[[params.social]]
  name = "GitHub"
  url = "https://github.com/xxx"
```

**FAQ 支持（frontmatter）：**
```yaml
faq:
  - q: "Question?"
    a: "Answer."
```

---

### 3. Comments (`shared/comments.html`)

**调用方式：**
```html
{{ partial "shared/comments.html" . }}
```

**读取的 params：**
```toml
[params.comments]
  enable = true
  provider = "giscus"       # giscus | waline | twikoo
  lazyload = true

  [params.comments.giscus]
    repo = ""
    repoId = ""
    category = ""
    categoryId = ""
    mapping = "pathname"
    lang = "en"
    themeLight = "light"
    themeDark = "dark"
```

**页面级禁用：**
```yaml
comments: false
```

**主题同步：** 通过 `comments-sync.ts` 监听主题切换事件，自动更新 Giscus iframe 主题。

---

### 4. Share Links (`shared/share-links.html`)

**调用方式：**
```html
{{ partial "shared/share-links.html" . }}
```

**读取的 params：**
```toml
[[params.shareLinks]]
  name = "Twitter"
  url = "https://twitter.com/intent/tweet?url={url}&text={title}"
  icon = "twitter"

[[params.shareLinks]]
  name = "Copy Link"
  action = "copy"
  icon = "link"
```

**默认值（未配置时）：** Twitter + LinkedIn + Telegram

**支持的 icon 值：** twitter, facebook, linkedin, telegram, whatsapp, link, mail

**URL 模板变量：** `{url}` = 页面 URL, `{title}` = 页面标题

---

### 5. Pagination (`shared/pagination.html`)

**调用方式：**
```html
{{ partial "shared/pagination.html" (dict "paginator" .Paginator "style" "numbered") }}
```

**style 选项：**
- `"simple"` — 只有 Prev/Next + "Page X / Y"
- `"numbered"` — 完整页码 + 省略号 + Prev/Next
- `"minimal"` — 只有 Prev/Next 箭头

**i18n keys：** `pagination.prev`, `pagination.next`, `pagination.page`

---

### 6. Back to Top (`shared/back-to-top.html`)

**调用方式：**
```html
{{ partial "shared/back-to-top.html" . }}
```

**读取的 params：**
```toml
[params.backToTop]
  enable = true
  threshold = 0.3       # 滚动 30% 后显示
  showProgress = true   # 显示阅读进度环
```

**TS 模块：** `BackToTop` class，可配置 threshold 和 progress callback。

---

### 7. Language Switcher (`shared/language-switcher.html`)

**调用方式：**
```html
{{ partial "shared/language-switcher.html" (dict "page" . "style" "dropdown") }}
```

**style 选项：**
- `"inline"` — 平铺显示所有语言（适合 2 种语言）
- `"dropdown"` — 下拉菜单（适合 3+ 种语言）

**读取的语言配置（Hugo 标准）：**
```toml
[languages.en]
  languageName = "English"
  weight = 1
  [languages.en.params]
    shortName = "EN"
```

---

### 8. Theme Toggle (`shared/theme-toggle.html`)

**调用方式：**
```html
{{ partial "shared/theme-toggle.html" . }}
```

**读取的 params：**
```toml
[params.theme]
  default = "system"        # light | dark | system
  locked = false            # 禁止用户切换
  attribute = "data-theme"  # 或 "class"
  storageKey = "theme"
  transition = true         # 切换时加 CSS transition
```

**TS 模块：** `ThemeManager` class

**Anti-FOUC：** `theme-init.ts` 必须同步加载在 `<head>` 中。

---

## 主题接入方式

### 1. 安装

各主题的 `package.json`：
```json
{
  "dependencies": {
    "@ouraihub/hugo-shared": "workspace:*"
  }
}
```

### 2. 符号链接 partials

在主题根目录创建符号链接（或在构建脚本中复制）：
```bash
ln -s ../../node_modules/@ouraihub/hugo-shared/layouts/partials/shared layouts/partials/shared
```

或在 `package.json` scripts 中：
```json
"predev": "cp -r node_modules/@ouraihub/hugo-shared/layouts/partials/shared layouts/partials/shared"
```

### 3. 使用

```html
<!-- baseof.html -->
<head>
  {{ partial "shared/seo-meta.html" . }}
  {{ partial "shared/schema.html" . }}
</head>
<body>
  ...
  {{ partial "shared/comments.html" . }}
  {{ partial "shared/back-to-top.html" . }}
</body>
```

### 4. 覆盖

主题可以在自己的 `layouts/partials/shared/` 中放同名文件覆盖共享模块的默认实现（Hugo 的 lookup order 会优先使用项目级文件）。

---

## DOM 属性统一方案

**问题：** 四个主题用不同的方式标记暗色模式。

**决策：** 统一使用 `data-theme="light|dark"` 属性在 `<html>` 上。

**原因：**
- 不和 Tailwind 的 `dark:` 类冲突（Tailwind v4 支持自定义 dark variant）
- 和 msgflow-site 保持一致
- Giscus 等第三方组件更容易检测

**迁移：** 各主题如果之前用 `class="dark"`，需要改为 `data-theme="dark"` 并更新 Tailwind 配置：
```css
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

---

## i18n 共享 keys

```toml
# i18n/en.toml
[pagination]
  prev = "Previous"
  next = "Next"
  page = "Page %d of %d"

[share]
  title = "Share this post"
  copied = "Link copied!"

[backToTop]
  label = "Back to top"

[theme]
  toggleLight = "Switch to light mode"
  toggleDark = "Switch to dark mode"

[comments]
  title = "Comments"
```

---

## 执行步骤

| 步骤 | 操作 |
|------|------|
| 1 | 在 ui-library 中创建 `packages/hugo-shared` 目录 |
| 2 | 从 paper（重构后）提取 8 个 partials 到 shared |
| 3 | 统一 params 接口（按本文档的 toml 规范） |
| 4 | 从 paper 提取 TS 模块到 shared |
| 5 | paper 改为引用 shared（删除本地重复文件） |
| 6 | 验证 paper 功能不变 |
| 7 | hugowind 接入 shared |
| 8 | fluid 接入 shared |
| 9 | butterfly 接入 shared |

每个主题接入时只需要：
1. 加 dependency
2. 链接 partials
3. 调整 params 格式匹配统一接口
4. 删除本地重复的 partial

---

## 不做的事

- ❌ 不统一视觉样式（每个主题保留自己的 CSS）
- ❌ 不强制所有主题用相同的 pagination style
- ❌ 不处理主题特有的功能（如 butterfly 的侧边栏、hugowind 的 landing page widgets）
- ❌ 不发布到 npm（workspace 内部使用）
