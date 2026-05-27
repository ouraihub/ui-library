# Phase 3 开发指南

## 1. @ouraihub/astro 组件开发

### 实现模式

每个 `.astro` 组件遵循统一模式：

```astro
---
// 1. 定义 Props 接口
interface Props {
  class?: string;
  // 组件特有 props...
}
const { class: className = '', ...rest } = Astro.props;
---

<!-- 2. 渲染 HTML 结构 -->
<div class={className}>
  <!-- 组件 HTML -->
</div>

<!-- 3. 客户端脚本调用 core -->
<script>
  import { SomeManager } from '@ouraihub/core';
  const manager = new SomeManager(/* options */);
  manager.init();
  // 注意：Astro 的 <script> 默认会被打包，只执行一次
</script>
```

### 参考现有实现

`packages/astro/src/components/SEO.astro` — 纯服务端渲染，无客户端 JS：

```astro
---
import { SEOManager } from '@ouraihub/core';
const seo = new SEOManager(Astro.props);
const metaTags = seo.generateMetaTags();
---
<Fragment set:html={metaTags} />
```

### 需要实现的组件（11 个）

| 组件 | 类型 | 实现要点 |
|------|------|---------|
| SEO.astro | 服务端 | 已有，不用改 |
| Icon.astro | 服务端 | 从 @ouraihub/icons 读 path，渲染 SVG |
| ShareLinks.astro | 服务端 | 调用 getShareLinks()，渲染 `<a>` 列表 |
| ThemeToggle.astro | 客户端 | `<script>` 里 import ThemeManager |
| CodeCopy.astro | 客户端 | `<script>` 里 import CodeCopyManager，onload init |
| BackToTop.astro | 客户端 | 渲染按钮 + `<script>` 里 BackToTop 控制显隐 |
| ReadingProgress.astro | 客户端 | 渲染 div + `<script>` 里 ReadingProgress 更新 width |
| TOC.astro | 混合 | Props 传 headings 渲染列表，`<script>` 里 TOCHighlighter |
| Comments.astro | 客户端 | 渲染容器 div + `<script>` 里 CommentManager.mount |
| Search.astro | 客户端 | 渲染 input + results + `<script>` 里 SearchAdapter |
| KeyboardShortcuts.astro | 客户端 | 无 HTML，纯 `<script>` 注册快捷键 |

### 文件结构

```
packages/astro/src/components/
├── SEO.astro              # 已有
├── Icon.astro
├── ShareLinks.astro
├── ThemeToggle.astro
├── CodeCopy.astro
├── BackToTop.astro
├── ReadingProgress.astro
├── TOC.astro
├── Comments.astro
├── Search.astro
└── KeyboardShortcuts.astro
```

### package.json exports

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./SEO.astro": "./src/components/SEO.astro",
    "./Icon.astro": "./src/components/Icon.astro"
    // ... 每个组件单独导出
  }
}
```

---

## 2. @ouraihub/hugo partials 开发

### 实现模式

Hugo partial 分两部分：
1. HTML partial（`layouts/partials/ouraihub/xxx.html`）— 渲染结构
2. JS bundle（`assets/ts/ouraihub.ts`）— 调用 core 的初始化逻辑

#### HTML partial 模板

```html
{{/* layouts/partials/ouraihub/code-copy.html */}}
{{/* 无需渲染 HTML，只注入 JS 初始化 */}}
{{ .Page.Scratch.SetInMap "this" "codeCopy" true }}
```

#### JS 入口（统一）

```typescript
// assets/ts/ouraihub.ts
import { CodeCopyManager } from '@ouraihub/core';
import { BackToTop } from '@ouraihub/core';
// ...

// 按需初始化（根据 page scratch 标记）
if (document.querySelector('pre')) {
  new CodeCopyManager().init();
}

new BackToTop({
  threshold: 0.3,
  onShow: () => document.getElementById('btt')?.classList.remove('hidden'),
  onHide: () => document.getElementById('btt')?.classList.add('hidden'),
}).init();
```

#### 需要 HTML 结构的 partial

```html
{{/* layouts/partials/ouraihub/back-to-top.html */}}
<button id="btt" class="hidden fixed bottom-8 right-8 ...">↑</button>
```

```html
{{/* layouts/partials/ouraihub/share-links.html */}}
{{ $url := .Permalink }}
{{ $title := .Title }}
<div class="share-links">
  <a href="https://twitter.com/intent/tweet?url={{ $url }}&text={{ $title }}" target="_blank">Twitter</a>
  <a href="https://www.facebook.com/sharer.php?u={{ $url }}" target="_blank">Facebook</a>
</div>
```

### 已有 vs 需新增

| Partial | 状态 | 说明 |
|---------|------|------|
| theme-toggle.html | ✅ 已有 | |
| seo-meta.html | ✅ 已有 | |
| seo-schema.html | ✅ 已有 | |
| search-modal.html | ✅ 已有 | |
| navigation.html | ✅ 已有 | |
| code-copy.html | ⬜ 新增 | JS 注入 |
| back-to-top.html | ⬜ 新增 | 按钮 + JS |
| reading-progress.html | ⬜ 新增 | 进度条 div + JS |
| share-links.html | ⬜ 新增 | 链接列表（Go 模板生成） |
| comments.html | ⬜ 新增 | 容器 + JS mount |
| toc.html | ⬜ 新增 | 列表 + JS 高亮 |

### 构建方式

Hugo 主题的 JS 通过 `assets/ts/` 目录用 ESBuild 打包：

```html
{{/* layouts/partials/assets.html */}}
{{ $js := resources.Get "ts/ouraihub.ts" | js.Build (dict "targetPath" "js/ouraihub.js") }}
<script src="{{ $js.RelPermalink }}" defer></script>
```

---

## 3. @ouraihub/preset-docs-svelte

### 定位

`npx degit ouraihub/preset-docs-svelte my-docs` 一键创建 SvelteKit 文档站。

### 基于现有代码

从 `~/workspace/open-source/ouraihub-docs/packages/shared/` 提取：

| 现有文件 | 对应模板文件 |
|---------|------------|
| shared/components/DocsLayout.svelte | template/src/lib/DocsLayout.svelte |
| shared/components/DocSidebar.svelte | template/src/lib/DocSidebar.svelte |
| shared/components/TableOfContents.svelte | template/src/lib/TableOfContents.svelte |
| shared/components/AiChat.svelte | 改用 @ouraihub/ai-chat 的 AiEmbed |
| shared/markdown.ts | template/src/lib/markdown.ts |

### 文件结构

```
packages/preset-docs-svelte/
├── package.json
├── README.md
└── template/
    ├── package.json
    ├── svelte.config.js
    ├── vite.config.ts
    ├── src/
    │   ├── app.html
    │   ├── app.css          # 基于 @ouraihub/tokens
    │   ├── routes/
    │   │   ├── +layout.svelte
    │   │   └── docs/
    │   │       └── [...slug]/+page.svelte
    │   └── lib/
    │       ├── DocsLayout.svelte
    │       ├── DocSidebar.svelte
    │       ├── TableOfContents.svelte
    │       ├── DocSearch.svelte    # 用 @ouraihub/svelte 的 Search
    │       └── markdown.ts
    └── static/
```

### 开发步骤

1. 创建 `packages/preset-docs-svelte/` 目录
2. 从 ouraihub-docs 的 shared 复制组件到 `template/src/lib/`
3. 把 `AiChat.svelte` 替换为 `import { AiEmbed } from '@ouraihub/ai-chat'`
4. 创建 `template/src/routes/` 路由结构
5. 写 `README.md`（使用说明）
6. 测试：`cd template && pnpm dev` 能跑起来

---

## 验收标准

- [ ] astro 包：11 个组件全部实现，`pnpm build` 通过
- [ ] hugo 包：6 个新 partial 实现，参考主题能正常渲染
- [ ] preset-docs-svelte：`cd template && pnpm dev` 能启动，页面正常显示
- [ ] 无循环依赖

---

## 补充说明

### Hugo 包如何引入 @ouraihub/core

Hugo 主题通过 npm 安装 core，然后用 Hugo 的 js.Build 管道打包：

```bash
# 在 hugo 主题目录
pnpm init
pnpm add @ouraihub/core
```

```
# 目录结构
packages/hugo/
├── assets/ts/ouraihub.ts    # 入口，import from @ouraihub/core
├── layouts/partials/ouraihub/  # HTML partials
├── package.json             # 依赖 @ouraihub/core
└── static/                  # 如果需要静态资源
```

Hugo 模板中引入打包后的 JS：

```html
{{/* layouts/partials/ouraihub/assets.html - 在 <head> 或 </body> 前调用 */}}
{{ with resources.Get "ts/ouraihub.ts" }}
  {{ $js := . | js.Build (dict "targetPath" "js/ouraihub.min.js" "minify" true) }}
  <script src="{{ $js.RelPermalink }}" defer></script>
{{ end }}
```

主题使用方在 `config.toml` 里 mount 这个模块：

```toml
[module]
  [[module.imports]]
    path = "github.com/ouraihub/ui-library/packages/hugo"
```

### preset-docs-svelte 现有组件参考

新窗口开发时需要读以下文件了解现有实现：

```
~/workspace/open-source/ouraihub-docs/packages/shared/components/DocsLayout.svelte
~/workspace/open-source/ouraihub-docs/packages/shared/components/DocSidebar.svelte
~/workspace/open-source/ouraihub-docs/packages/shared/components/TableOfContents.svelte
~/workspace/open-source/ouraihub-docs/packages/shared/components/AiChat.svelte
~/workspace/open-source/ouraihub-docs/packages/shared/markdown.ts
```

这些文件是 Phase 3 preset-docs-svelte 的基础，直接复制过来再重构为模板包。

### 新窗口启动指令

```
读 ~/workspace/open-source/ui-dev/ui-library/docs/phase3-dev-guide.md，
参考 packages/svelte/src/ 的实现模式，完成 Phase 3 开发。
astro 包参考现有 packages/astro/src/components/SEO.astro。
hugo 包参考现有 packages/hugo/layouts/partials/。
preset-docs-svelte 参考 ~/workspace/open-source/ouraihub-docs/packages/shared/。
```
