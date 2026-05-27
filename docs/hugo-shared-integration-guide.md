# Hugo 主题集成 @ouraihub/hugo-shared 指南

> 前置条件：`@ouraihub/hugo-shared` 已创建并通过 paper 验证。

## 通用步骤（三个主题都要做）

每个主题的集成流程相同：

```bash
# 1. 安装依赖
# 开发时用 file: 协议（本地联调）
pnpm add @ouraihub/hugo-shared@file:../ui-dev/ui-library/packages/hugo-shared
# 发布后改为 npm 版本（CI 和其他开发者用）
# pnpm add @ouraihub/hugo-shared@^0.1.0

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

### CI 部署注意事项

`file:` 协议在 CI 环境不可用（路径不存在）。两种解决方案：

**方案 A：发布到 npm 后用版本号（推荐）**
```json
"@ouraihub/hugo-shared": "^0.1.0"
```

**方案 B：CI 中 clone ui-library 手动复制（未发布时）**
```yaml
- name: Install dependencies
  run: |
    node -e "const p=require('./package.json'); delete p.dependencies['@ouraihub/hugo-shared']; require('fs').writeFileSync('package.json', JSON.stringify(p, null, 2))"
    pnpm install --ignore-scripts

- name: Sync shared modules
  run: |
    git clone --depth 1 https://github.com/ouraihub/ui-library.git /tmp/ui-library
    rm -rf layouts/partials/shared && cp -r /tmp/ui-library/packages/hugo-shared/partials layouts/partials/shared
    rm -rf assets/css/shared && cp -r /tmp/ui-library/packages/hugo-shared/css assets/css/shared
    mkdir -p node_modules/@ouraihub/hugo-shared
    cp -r /tmp/ui-library/packages/hugo-shared/* node_modules/@ouraihub/hugo-shared/
```

### Go Module 缓存注意事项

> ⚠️ **不要重复使用同一个 tag。** Go module proxy 会缓存 tag 对应的内容。如果 dist 仓库内容有变，必须用新版本号（如 v0.8.1 → v0.8.2），否则 `hugo mod get -u` 拉到的还是旧内容。

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
| 0 | **shared 包加 fallback** | 低 | 必须先做，否则其他主题 params 读不到值 |
| 1 | hugowind | 低 | 架构最好，改动最少 |
| 2 | hugo-butterfly | 中 | params 已兼容，但要删 schema 重复 |
| 3 | hugo-theme-fluid | 高 | DOM 属性 + params 结构差异大 |

---

## 步骤 0：先改 shared 包加 fallback 兼容

在 `packages/hugo-shared/partials/seo-meta.html` 中，确保变量读取有 fallback：

```html
{{- $author := .Site.Params.seo.author | default .Site.Params.author.name | default .Site.Params.author | default "" -}}
{{- $ogImage := .Params.image | default .Params.cover | default .Site.Params.seo.ogImage | default .Site.Params.og_image | default "" -}}
{{- $twitterCard := .Site.Params.seo.twitter.card | default "summary_large_image" -}}
{{- $twitterSite := .Site.Params.seo.twitter.site | default .Site.Params.seo.twitterUsername | default "" -}}
{{- $description := .Description | default .Summary | default .Site.Params.seo.description | default .Site.Params.description | default "" -}}
```

提交到 shared 包后再开始集成各主题。

---

## DOM 属性迁移详细指南

### hugowind：`.dark` class → `data-theme`

**CSS 改动（`assets/css/main.css`）— 全局替换：**

```
查找: @custom-variant dark (&:where(.dark, .dark *));
替换: @custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

查找: .dark {
替换: [data-theme="dark"] {

查找: .dark .
替换: [data-theme="dark"] .
```

**CSS 改动（`assets/css/syntax.css`）：**
```
查找: .dark :not(pre) > code
替换: [data-theme="dark"] :not(pre) > code
```

**TS 改动 — 删除 `assets/ts/toggle-theme.ts` 和 `assets/ts/modules/theme.ts`，新建 `assets/ts/toggle-theme.ts`：**

```ts
import { ThemeManager } from '@ouraihub/hugo-shared';

// 构造即生效（防闪烁）
const tm = new ThemeManager();

window.addEventListener('load', () => {
  document.querySelector('[data-aw-toggle-color-scheme]')
    ?.addEventListener('click', () => tm.toggle());
});
```

---

### fluid：`data-user-color-scheme` → `data-theme`

**CSS 改动（`assets/css/main.css`）— 全局替换：**

```
查找: data-user-color-scheme
替换: data-theme
```

这会影响约 8 处（第 91、132、169、3182、3183、3187、4037 行等）。替换后确认格式正确：`[data-theme='dark']` 或 `[data-theme="dark"]`（两种引号都行）。

**TS 改动 — 删除 `assets/ts/color-schema.ts`，在 `assets/ts/main.ts` 顶部加：**

```ts
import { ThemeManager } from '@ouraihub/hugo-shared';

// 构造即生效（防闪烁）
const tm = new ThemeManager();

document.getElementById('color-toggle-btn')?.addEventListener('click', () => {
  tm.toggle();
});
```

删除 `main.ts` 中原有的 `import ... from './color-schema'` 和相关调用。

**注意：** 原 storageKey 是 `'Fluid_Color_Scheme'`，改为 `'theme'` 后老用户的偏好会重置一次。如需兼容可传 `{ storageKey: 'Fluid_Color_Scheme' }`。

---

## butterfly schema 重复问题

butterfly 的 `layouts/partials/head/seo.html` 第 116-185 行包含 schema JSON-LD（Article + Breadcrumb）。

**集成时必须删除整个 `head/seo.html` 文件**，然后在 `baseof.html` 的 `<head>` 中加：

```html
{{ partial "shared/seo-meta.html" . }}
{{ partial "shared/schema.html" . }}
```

**不能保留 seo.html 的部分内容**——shared 的两个 partial 已经完整覆盖了 SEO meta + schema 的所有功能。

---

## ThemeManager 接口说明

shared 导出的 `ThemeManager` class 接口：

```ts
interface ThemeManagerConfig {
  storageKey?: string;    // 默认 'theme'
  attribute?: string;     // 默认 'data-theme'
  element?: HTMLElement;  // 默认 document.documentElement
}

class ThemeManager {
  constructor(config?: ThemeManagerConfig);
  // 构造时自动 apply（防闪烁），无需手动调用
  get resolved(): 'light' | 'dark';  // 当前解析后的主题
  get mode(): ThemeMode;             // 当前模式 'light' | 'dark' | 'system'
  toggle(): void;                    // 切换 light ↔ dark
  setTheme(mode: ThemeMode): void;   // 设置指定模式
}
```

各主题用法：
```ts
import { ThemeManager } from '@ouraihub/hugo-shared';

// 构造即生效（同步执行，防 FOUC）
const tm = new ThemeManager();

// 按钮绑定
window.addEventListener('load', () => {
  document.querySelector('#theme-btn')
    ?.addEventListener('click', () => tm.toggle());
});
```

> ⚠️ ThemeManager 必须在 `<head>` 中同步加载（不能 defer），否则会闪烁。
