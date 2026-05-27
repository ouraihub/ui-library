# Hugo 主题集成 @ouraihub/hugo-shared 指南

> 前置条件：`@ouraihub/hugo-shared` 已创建并通过 paper 验证。

## 通用步骤（三个主题都要做）

每个主题的集成流程相同：

```bash
# 1. 安装依赖
pnpm add @ouraihub/hugo-shared@file:../../ui-dev/ui-library/packages/hugo-shared

# 2. 加构建脚本（package.json scripts）
"sync:shared": "rm -rf layouts/partials/shared && cp -r node_modules/@ouraihub/hugo-shared/partials layouts/partials/shared && rm -rf assets/css/shared && cp -r node_modules/@ouraihub/hugo-shared/css assets/css/shared",
"predev": "pnpm sync:shared",
"prebuild": "pnpm sync:shared"

# 3. .gitignore 加
layouts/partials/shared/
assets/css/shared/

# 4. 改 partial 引用 + 调整 params + 删重复文件 + 改 TS import
# （每个主题不同，见下方）

# 5. 验证
pnpm dev
```

---

## hugo-butterfly 集成

### 特点
- 65 个 partials，功能最多
- 无 TS 模块（纯 inline script + bundle.js）
- Giscus params 已经是 `params.comments.giscus.*` 格式 ✅
- 用 `data-theme` 属性 ✅

### Partial 引用改动

| 当前文件 | 当前引用 | 改为 |
|----------|----------|------|
| `layouts/_default/baseof.html` | `{{ partial "head/seo.html" . }}` | `{{ partial "shared/seo-meta.html" . }}` |
| `layouts/_default/baseof.html` | (schema 在 seo.html 内) | 加 `{{ partial "shared/schema.html" . }}` |
| `layouts/_default/single.html` | `{{ partial "post/post-share.html" . }}` | `{{ partial "shared/share-links.html" . }}` |
| `layouts/_default/single.html` | `{{ partial "comments/comments.html" . }}` | `{{ partial "shared/comments.html" . }}` |
| `layouts/partials/components/pagination.html` 被引用处 | `{{ partial "components/pagination.html" . }}` | `{{ partial "shared/pagination.html" (dict "paginator" .Paginator "style" "numbered") }}` |
| `layouts/partials/header/header.html` | `{{ partial "header/language-switcher.html" . }}` | `{{ partial "shared/language-switcher.html" (dict "page" . "style" "dropdown") }}` |

### Params 调整

**不需要改。** butterfly 的 comments 已经是 `params.comments.giscus.*` 格式。

SEO params 需要小调整：
```toml
# 当前
[params.author]
  name = "xxx"
  avatar = "xxx"

# 加一层 seo 映射（或在 shared/seo-meta.html 中兼容两种路径）
[params.seo]
  author = "xxx"
  ogImage = "xxx"
```

**建议：** 在 shared 的 `seo-meta.html` 中加 fallback 逻辑：
```html
{{- $author := .Site.Params.seo.author | default .Site.Params.author.name | default .Site.Author.name -}}
```

### 删除的文件

```bash
rm layouts/partials/head/seo.html
rm layouts/partials/comments/comments.html
rm layouts/partials/comments/giscus.html
rm layouts/partials/post/post-share.html
rm layouts/partials/components/pagination.html
```

保留 butterfly 特有的：`comments/twikoo.html`、`comments/waline.html`、`comments/utterances.html`（shared 暂不覆盖这些）。

### TS 改动

butterfly 当前没有独立 TS 模块（用 inline script）。集成 shared 后可以：
```ts
// assets/ts/main.ts
import { BackToTop, CodeCopyManager } from '@ouraihub/hugo-shared';
```

替换 inline script 中的对应功能。但这是可选的——不改也能工作。

---

## hugo-theme-fluid 集成

### 特点
- 15 个 TS 文件，模块化程度高
- Giscus params 是 `params.giscus.*`（顶层，需要改）
- 用 `data-user-color-scheme` 属性（需要改为 `data-theme`）
- 有自己的 color-schema.ts

### Partial 引用改动

| 当前文件 | 当前引用 | 改为 |
|----------|----------|------|
| `layouts/_default/baseof.html` | `{{ partial "head/seo-meta.html" . }}` | `{{ partial "shared/seo-meta.html" . }}` |
| `layouts/_default/single.html` | `{{ partial "comments/comments.html" . }}` | `{{ partial "shared/comments.html" . }}` |
| `layouts/_default/baseof.html` | `{{ partial "back-to-top.html" . }}` | `{{ partial "shared/back-to-top.html" . }}` |
| `layouts/partials/header/header.html` | `{{ partial "language-switcher.html" . }}` | `{{ partial "shared/language-switcher.html" (dict "page" . "style" "dropdown") }}` |

### Params 调整（关键）

```toml
# 当前（顶层 giscus）
[params.giscus]
  repo = ""
  "repo-id" = ""
  category = ""
  "category-id" = ""

# 改为（统一接口）
[params.comments]
  enable = true
  provider = "giscus"
  lazyload = true

  [params.comments.giscus]
    repo = ""
    repoId = ""
    category = ""
    categoryId = ""
```

SEO params：
```toml
# 当前
[params]
  author = "xxx"
  og_image = "/img/og.png"

# 改为
[params.seo]
  author = "xxx"
  ogImage = "/img/og.png"
```

### DOM 属性迁移（关键）

fluid 用 `data-user-color-scheme`，需要改为 `data-theme`：

1. 删除 `assets/ts/color-schema.ts`
2. 改为 import shared 的 ThemeManager：
```ts
import { ThemeManager } from '@ouraihub/hugo-shared';
```
3. CSS 中 `[data-user-color-scheme=dark]` 全局替换为 `[data-theme=dark]`
4. Tailwind 配置加：
```css
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

### 删除的文件

```bash
rm layouts/partials/head/seo-meta.html
rm layouts/partials/comments/comments.html
rm layouts/partials/comments/giscus.html
rm layouts/partials/back-to-top.html
rm layouts/partials/language-switcher.html
rm assets/ts/color-schema.ts
```

### TS 改动

```ts
// assets/ts/main.ts
import { ThemeManager, BackToTop, CodeCopyManager } from '@ouraihub/hugo-shared';
```

删除本地的 `color-schema.ts`、`toc.ts` 中的主题检测逻辑改为读 `data-theme`。

---

## hugowind 集成

### 特点
- 架构最好（modules/ 分层）
- 无评论系统
- 用 `class="dark"` 切换（需要改为 `data-theme`）
- 有 `metadata.openGraph.*` 深层嵌套 params

### Partial 引用改动

| 当前文件 | 当前引用 | 改为 |
|----------|----------|------|
| `layouts/_default/baseof.html` | `{{ partial "head/seo.html" . }}` | `{{ partial "shared/seo-meta.html" . }}` |
| `layouts/_default/baseof.html` | `{{ partial "head/schema.html" . }}` | `{{ partial "shared/schema.html" . }}` |
| `layouts/_default/single.html` | `{{ partial "blog/social-share.html" . }}` | `{{ partial "shared/share-links.html" . }}` |
| `layouts/_default/list.html` | `{{ partial "blog/pagination.html" . }}` | `{{ partial "shared/pagination.html" (dict "paginator" .Paginator "style" "simple") }}` |
| `layouts/partials/header/main.html` | `{{ partial "header/language-switcher.html" . }}` | `{{ partial "shared/language-switcher.html" (dict "page" . "style" "dropdown") }}` |
| `layouts/partials/header/main.html` | `{{ partial "header/theme-toggle.html" . }}` | `{{ partial "shared/theme-toggle.html" . }}` |

### Params 调整（关键）

```toml
# 当前（深层嵌套）
[params.metadata]
  [params.metadata.title]
    default = "Site"
    template = "%s — %s"
  [params.metadata.openGraph]
    [params.metadata.openGraph.image]
      url = "/og.png"
  [params.metadata.twitter]
    cardType = "summary_large_image"
    site = "@handle"

# 改为（统一接口）
[params.seo]
  description = "..."
  author = "..."
  ogImage = "/og.png"
  [params.seo.twitter]
    card = "summary_large_image"
    site = "@handle"
```

### DOM 属性迁移

hugowind 用 `classList.toggle('dark')`，需要改为 `data-theme`：

1. 删除 `assets/ts/modules/theme.ts` 和 `assets/ts/toggle-theme.ts`
2. 改为 import shared：
```ts
import { ThemeManager } from '@ouraihub/hugo-shared';
```
3. CSS 中 `.dark` 选择器替换为 `[data-theme=dark]`
4. Tailwind 配置加 `@custom-variant dark`

### 删除的文件

```bash
rm layouts/partials/head/seo.html
rm layouts/partials/head/schema.html
rm layouts/partials/blog/social-share.html
rm layouts/partials/blog/pagination.html
rm layouts/partials/header/language-switcher.html
rm layouts/partials/header/theme-toggle.html
rm assets/ts/modules/theme.ts
rm assets/ts/toggle-theme.ts
```

### TS 改动

```ts
// assets/ts/main.ts
import { ThemeManager, BackToTop } from '@ouraihub/hugo-shared';
```

保留 `assets/ts/modules/nav.ts`、`assets/ts/modules/search.ts`、`assets/ts/modules/animations.ts`（主题特有）。

---

## 执行优先级

| 顺序 | 主题 | 难度 | 原因 |
|------|------|------|------|
| 1 | hugowind | 低 | 架构最好，TS 模块化，改动最少 |
| 2 | hugo-butterfly | 中 | params 已兼容，但文件多 |
| 3 | hugo-theme-fluid | 高 | DOM 属性要改 + params 结构差异大 |

---

## shared/seo-meta.html 兼容性增强

为了让四个主题都能用同一个 seo-meta.html，需要在 partial 中加 fallback 逻辑：

```html
{{- /* Author: 兼容多种 params 路径 */ -}}
{{- $author := .Site.Params.seo.author | default .Site.Params.author.name | default .Site.Params.author | default .Site.Author.name -}}

{{- /* OG Image: 兼容多种 params 路径 */ -}}
{{- $ogImage := .Params.image | default .Params.cover | default .Site.Params.seo.ogImage | default .Site.Params.og_image -}}

{{- /* Twitter: 兼容多种 params 路径 */ -}}
{{- $twitterCard := .Site.Params.seo.twitter.card | default .Site.Params.metadata.twitter.cardType | default "summary_large_image" -}}
```

这样各主题迁移时不需要立即改 params 结构，可以渐进式迁移。
