# Hugo 共享模块设计文档（可执行版）

## 架构决策

| 问题 | 决策 | 原因 |
|------|------|------|
| Partials 怎么共享 | 构建脚本 `cp -r` 到主题的 `layouts/partials/shared/` | Hugo 只认 layouts/ 目录，不跟 symlink/node_modules |
| TS 怎么共享 | esbuild 直接 import（node_modules 正常解析） | 主题已经用 esbuild 编译 TS，天然支持 |
| CSS 怎么共享 | 构建脚本复制到 `assets/css/` | Tailwind CLI 需要文件在本地 |
| 放在哪 | `ui-library/packages/hugo-shared` | workspace 内部，pnpm 自动链接 |

## 包结构

```
packages/hugo-shared/
├── package.json
├── partials/                    ← Hugo partials（构建时复制到主题）
│   ├── seo-meta.html
│   ├── schema.html
│   ├── comments.html
│   ├── giscus.html
│   ├── share-links.html
│   ├── pagination.html
│   ├── back-to-top.html
│   ├── language-switcher.html
│   └── theme-toggle.html
├── ts/                          ← TS 模块（esbuild import）
│   ├── index.ts                 ← 统一导出
│   ├── theme-manager.ts
│   ├── back-to-top.ts
│   ├── code-copy.ts
│   ├── heading-links.ts
│   ├── reading-progress.ts
│   └── comments-sync.ts
├── css/                         ← CSS（构建时复制到主题）
│   ├── chroma-light.css
│   └── chroma-dark.css
└── i18n/                        ← 共享翻译
    ├── en.toml
    └── zh.toml
```

## package.json

```json
{
  "name": "@ouraihub/hugo-shared",
  "version": "0.1.0",
  "type": "module",
  "main": "./ts/index.ts",
  "exports": {
    ".": "./ts/index.ts",
    "./partials/*": "./partials/*",
    "./css/*": "./css/*",
    "./i18n/*": "./i18n/*"
  }
}
```

## 主题接入方式

### 1. 添加依赖

主题的 `package.json`：
```json
{
  "dependencies": {
    "@ouraihub/hugo-shared": "workspace:*"
  }
}
```

### 2. 构建脚本

主题的 `package.json` scripts 中加：
```json
{
  "scripts": {
    "sync:shared": "cp -r node_modules/@ouraihub/hugo-shared/partials layouts/partials/shared && cp -r node_modules/@ouraihub/hugo-shared/css assets/css/shared && cp -r node_modules/@ouraihub/hugo-shared/i18n i18n/shared",
    "predev": "pnpm sync:shared",
    "prebuild": "pnpm sync:shared"
  }
}
```

执行 `pnpm dev` 时自动同步共享文件到主题目录。

### 3. TS 引用

主题的 `assets/ts/main.ts`：
```ts
import { ThemeManager, BackToTop, CodeCopy, HeadingLinks } from '@ouraihub/hugo-shared';
```

esbuild 会自动从 node_modules 解析，无需额外配置。

### 4. 模板中使用

```html
{{ partial "shared/seo-meta.html" . }}
{{ partial "shared/schema.html" . }}
{{ partial "shared/comments.html" . }}
```

### 5. .gitignore

主题的 `.gitignore` 中加：
```
layouts/partials/shared/
assets/css/shared/
i18n/shared/
```

这些是构建时生成的，不提交到 Git。

---

## 每个 Partial 的实现来源和改动

### seo-meta.html

**来源：** `hugo-theme-paper/layouts/partials/seo-meta.html`（重构后版本）

**需要改动：**
- 无需改动，paper 的当前实现已经是统一接口格式

**params 路径（已统一）：**
```
.Description / .Site.Params.seo.description
.Params.author / .Site.Params.seo.author
.Params.image / .Site.Params.seo.ogImage
```

---

### schema.html

**来源：** `hugo-theme-paper/layouts/partials/schema.html`（重构后版本）

**需要改动：**
- 社交链接字段：确保读 `.Site.Params.social[].href`（paper 已修复）
- 加入 FAQPage 逻辑（paper 已有）

---

### comments.html

**来源：** `hugo-theme-paper/layouts/partials/comments.html` + `giscus.html`

**需要改动：**
- 加 lazyload 支持（IntersectionObserver）
- 加页面级禁用检查：`{{ if ne .Params.comments false }}`

**统一 params 路径：**
```toml
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

**paper 当前路径对比：**
```
当前: .Site.Params.comments.enable → 不变
当前: .Site.Params.comments.provider → 不变
当前: .Site.Params.comments.repo → 改为 .Site.Params.comments.giscus.repo
```

---

### share-links.html

**来源：** `hugo-theme-paper/layouts/partials/share-links.html`（重构后版本，已可配置）

**需要改动：** 无，paper 的当前实现已经是配置驱动 + fallback。

---

### pagination.html

**来源：** `hugo-theme-paper/layouts/partials/pagination.html`

**需要改动：**
- 加 `style` 参数支持（当前只有 simple 风格）
- 加 numbered 风格实现（从 butterfly 参考）

**调用方式变化：**
```html
<!-- 之前 -->
{{ partial "pagination.html" . }}

<!-- 之后 -->
{{ partial "shared/pagination.html" (dict "paginator" .Paginator "style" "simple") }}
```

---

### back-to-top.html

**来源：** `hugo-theme-paper/layouts/partials/back-to-top.html`

**需要改动：** 无，HTML 部分很简单。逻辑在 TS 模块中。

---

### language-switcher.html

**来源：** `hugo-theme-paper/layouts/partials/language-switcher.html`

**需要改动：**
- 加 `style` 参数（inline / dropdown）
- 当前 paper 是 inline 风格，需要加 dropdown 实现

---

### theme-toggle.html

**来源：** `hugo-theme-paper/layouts/partials/theme-toggle.html`

**需要改动：** 无，HTML 只是一个按钮 + SVG 图标。逻辑在 TS 模块中。

---

## TS 模块来源和改动

| 模块 | 来源 | 改动 |
|------|------|------|
| theme-manager.ts | paper `assets/ts/toggle-theme.ts` | 提取 class，去掉 DOM 绑定（纯逻辑） |
| back-to-top.ts | paper `assets/ts/modules/back-to-top.ts` | 无 |
| code-copy.ts | paper `assets/ts/modules/code-copy.ts` | 无 |
| heading-links.ts | paper `assets/ts/modules/heading-links.ts` | 无 |
| reading-progress.ts | paper `assets/ts/modules/reading-progress.ts` | 无 |
| comments-sync.ts | 新写 | 监听主题切换，更新 Giscus iframe |

**index.ts 导出：**
```ts
export { ThemeManager } from './theme-manager';
export { BackToTop } from './back-to-top';
export { CodeCopy } from './code-copy';
export { initHeadingLinks } from './heading-links';
export { ReadingProgress } from './reading-progress';
export { initCommentsSync } from './comments-sync';
```

---

## Paper 迁移改动清单

paper 接入 shared 后需要改的文件：

| 文件 | 改动 |
|------|------|
| `package.json` | 加 `@ouraihub/hugo-shared` 依赖 + `sync:shared` 脚本 |
| `.gitignore` | 加 `layouts/partials/shared/` 等 |
| `layouts/_default/baseof.html` | `{{ partial "seo-meta.html" . }}` → `{{ partial "shared/seo-meta.html" . }}` |
| `layouts/_default/single.html` | 同上，comments/share-links/schema |
| `layouts/partials/` | 删除本地的 seo-meta/schema/comments/share-links/pagination/back-to-top/language-switcher/theme-toggle |
| `assets/ts/main.ts` | import 改为 `from '@ouraihub/hugo-shared'` |
| `assets/ts/modules/` | 删除（已移到 shared） |
| `assets/ts/toggle-theme.ts` | 删除，改为 import shared 的 ThemeManager |
| `hugo.toml` | comments 的 params 路径调整（repo → giscus.repo） |

---

## 执行步骤（给大模型的）

### 步骤 1: 创建 packages/hugo-shared

```bash
mkdir -p packages/hugo-shared/{partials,ts,css,i18n}
```

创建 `packages/hugo-shared/package.json`：
```json
{
  "name": "@ouraihub/hugo-shared",
  "version": "0.1.0",
  "type": "module",
  "main": "./ts/index.ts",
  "exports": {
    ".": "./ts/index.ts",
    "./partials/*": "./partials/*",
    "./css/*": "./css/*",
    "./i18n/*": "./i18n/*"
  }
}
```

在 `pnpm-workspace.yaml` 中确认 `packages/*` 已包含。

### 步骤 2: 从 paper 复制 TS 模块

```bash
cp hugo-theme-paper/assets/ts/modules/back-to-top.ts packages/hugo-shared/ts/
cp hugo-theme-paper/assets/ts/modules/code-copy.ts packages/hugo-shared/ts/
cp hugo-theme-paper/assets/ts/modules/heading-links.ts packages/hugo-shared/ts/
cp hugo-theme-paper/assets/ts/modules/reading-progress.ts packages/hugo-shared/ts/
cp hugo-theme-paper/assets/ts/modules/logger.ts packages/hugo-shared/ts/
```

从 `hugo-theme-paper/assets/ts/toggle-theme.ts` 提取 ThemeManager class 到 `packages/hugo-shared/ts/theme-manager.ts`（去掉 DOM 绑定部分，只保留纯逻辑 class）。

### 步骤 3: 创建 ts/index.ts

```ts
export { BackToTop } from './back-to-top';
export { CodeCopyManager } from './code-copy';
export { initHeadingLinks } from './heading-links';
export { ReadingProgress } from './reading-progress';
export { createLogger } from './logger';
export { ThemeManager } from './theme-manager';
```

### 步骤 4: 从 paper 复制 partials

```bash
cp hugo-theme-paper/layouts/partials/seo-meta.html packages/hugo-shared/partials/
cp hugo-theme-paper/layouts/partials/schema.html packages/hugo-shared/partials/
cp hugo-theme-paper/layouts/partials/comments.html packages/hugo-shared/partials/
cp hugo-theme-paper/layouts/partials/giscus.html packages/hugo-shared/partials/
cp hugo-theme-paper/layouts/partials/share-links.html packages/hugo-shared/partials/
cp hugo-theme-paper/layouts/partials/pagination.html packages/hugo-shared/partials/
cp hugo-theme-paper/layouts/partials/back-to-top.html packages/hugo-shared/partials/
cp hugo-theme-paper/layouts/partials/language-switcher.html packages/hugo-shared/partials/
cp hugo-theme-paper/layouts/partials/theme-toggle.html packages/hugo-shared/partials/
```

### 步骤 5: 调整 partials 中的 params 路径

只有 `giscus.html` 需要改。在 `packages/hugo-shared/partials/giscus.html` 中做以下替换：

| 查找 | 替换为 |
|------|--------|
| `.Site.Params.comments.repo` | `.Site.Params.comments.giscus.repo` |
| `.Site.Params.comments.repoId` | `.Site.Params.comments.giscus.repoId` |
| `.Site.Params.comments.category` | `.Site.Params.comments.giscus.category` |
| `.Site.Params.comments.categoryId` | `.Site.Params.comments.giscus.categoryId` |
| `.Site.Params.comments.mapping` | `.Site.Params.comments.giscus.mapping` |
| `.Site.Params.comments.strict` | `.Site.Params.comments.giscus.strict` |
| `.Site.Params.comments.reactionsEnabled` | `.Site.Params.comments.giscus.reactionsEnabled` |
| `.Site.Params.comments.emitMetadata` | `.Site.Params.comments.giscus.emitMetadata` |
| `.Site.Params.comments.inputPosition` | `.Site.Params.comments.giscus.inputPosition` |

其他 partials（seo-meta、schema、share-links 等）不需要改 params 路径。

### 步骤 6: 复制 CSS

```bash
cp hugo-theme-paper/assets/css/chroma-light.css packages/hugo-shared/css/
cp hugo-theme-paper/assets/css/chroma-dark.css packages/hugo-shared/css/
```

### 步骤 7: paper 加依赖和构建脚本

在 `hugo-theme-paper/package.json` 中：

加依赖：
```json
"dependencies": {
  "@ouraihub/hugo-shared": "workspace:*"
}
```

加脚本：
```json
"sync:shared": "rm -rf layouts/partials/shared && cp -r node_modules/@ouraihub/hugo-shared/partials layouts/partials/shared && cp -r node_modules/@ouraihub/hugo-shared/css assets/css/shared",
"predev": "pnpm sync:shared",
"prebuild": "pnpm sync:shared"
```

运行 `pnpm install` 让 workspace 链接生效。

### 步骤 8: paper 改 partial 引用路径

需要改的文件和具体改动：

**`layouts/_default/baseof.html`：**
```
{{ partial "seo-meta.html" . }}  →  {{ partial "shared/seo-meta.html" . }}
{{ partial "schema.html" . }}    →  {{ partial "shared/schema.html" . }}
```

**`layouts/_default/single.html`：**
```
{{ partial "share-links.html" . }}  →  {{ partial "shared/share-links.html" . }}
{{ partial "back-to-top.html" . }}  →  {{ partial "shared/back-to-top.html" . }}
```

**`layouts/partials/header.html`：**
```
{{ partial "language-switcher.html" . }}  →  {{ partial "shared/language-switcher.html" . }}
```

**`layouts/partials/comments.html`：**
这个文件本身移到了 shared，但它内部引用了 giscus：
```
{{ partial "giscus.html" . }}  →  {{ partial "shared/giscus.html" . }}
```

**`layouts/_default/list.html`、`layouts/tag/term.html`、`layouts/category/list.html`：**
```
{{ partial "pagination.html" . }}  →  {{ partial "shared/pagination.html" . }}
```

### 步骤 9: paper 删除本地重复文件

```bash
cd hugo-theme-paper
rm layouts/partials/seo-meta.html
rm layouts/partials/schema.html
rm layouts/partials/comments.html
rm layouts/partials/giscus.html
rm layouts/partials/share-links.html
rm layouts/partials/pagination.html
rm layouts/partials/back-to-top.html
rm layouts/partials/language-switcher.html
rm layouts/partials/theme-toggle.html
```

### 步骤 10: paper 的 main.ts 改 import

当前 `assets/ts/main.ts`：
```ts
import {
  CodeCopyManager,
  BackToTop,
  ReadingProgress,
  initHeadingLinks,
  createLogger,
} from './modules';
```

改为：
```ts
import {
  CodeCopyManager,
  BackToTop,
  ReadingProgress,
  initHeadingLinks,
  createLogger,
} from '@ouraihub/hugo-shared';
```

然后删除 `assets/ts/modules/` 目录（已移到 shared）。

保留 `assets/ts/nav.ts`（主题特有逻辑，不共享）。

### 步骤 11: 验证

```bash
pnpm dev
```

访问 http://localhost:1313 检查：
- [ ] 首页正常渲染
- [ ] 文章页代码高亮正常（亮/暗切换）
- [ ] 代码复制按钮工作
- [ ] 返回顶部按钮工作
- [ ] 主题切换正常（无闪烁）
- [ ] 语言切换正常
- [ ] 分享链接显示
- [ ] 查看源码：`og:title` 只出现 1 次
- [ ] 查看源码：有 BreadcrumbList schema

### 步骤 12: 更新 paper 的 hugo.toml

comments 的 params 结构调整：

**改前：**
```toml
[params.comments]
  enable = false
  provider = "giscus"
  repo = ""
  repoId = ""
  category = ""
  categoryId = ""
```

**改后：**
```toml
[params.comments]
  enable = false
  provider = "giscus"
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

### 步骤 13: paper 的 .gitignore

追加：
```
layouts/partials/shared/
assets/css/shared/
```

---

## DOM 属性统一

所有主题统一使用 `<html data-theme="light|dark">`。

Tailwind v4 配置：
```css
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

---

## 不做的事

- ❌ 不统一视觉样式
- ❌ 不处理主题特有功能
- ❌ 不发布到 npm（workspace 内部）
- ❌ 不用 Hugo Modules（项目不用 go.mod）
- ❌ 不用 symlink（不可靠）
