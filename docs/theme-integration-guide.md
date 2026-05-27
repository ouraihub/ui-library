# 各主题集成 @ouraihub/ui-library 后的重构建议

## 总览

ui-library Phase 2 完成后，各主题可以删除自己的重复实现，改为调用 core。以下是每个主题需要做的事。

---

## hugo-theme-paper

### 可删除（改用 core）

| 当前文件 | 替换为 | 节省代码 |
|---------|--------|---------|
| `assets/ts/toggle-theme.ts` | 已用 `@ouraihub/core` ThemeManager ✅ | — |
| `assets/ts/main.ts` 中 attachCopyButtons | `@ouraihub/core` CodeCopyManager | ~60 行 |
| `assets/ts/main.ts` 中 backToTop | `@ouraihub/core` BackToTop | ~40 行 |
| `assets/ts/main.ts` 中 addHeadingLinks | `@ouraihub/core` HeadingLinks | ~20 行 |
| `assets/ts/main.ts` 中 createProgressBar | `@ouraihub/core` ReadingProgress | ~50 行 |
| `layouts/partials/share-links.html` 中 URL 拼接 | `@ouraihub/core` ShareManager | ~30 行 |
| `layouts/partials/giscus.html` | `@ouraihub/hugo` comments partial | ~50 行 |
| `layouts/partials/keyboard-shortcuts.html` | `@ouraihub/core` KeyboardShortcuts | ~180 行 |

### 主题自己保留

- Header 布局（极简导航 + 汉堡菜单）
- Footer 布局
- 文章排版样式（typography.css）
- 配色方案（ouraihub-mapping.css 映射层）
- Pagefind 搜索页面布局
- 代码高亮配置（Shiki/Chroma）
- 移动端响应式

### 重构步骤

1. `main.ts` 拆分：删除 codeCopy/backToTop/headingLinks/readingProgress，改为 import core
2. `share-links.html`：partial 内调用 `@ouraihub/hugo` 的 share partial
3. `giscus.html`：替换为 `@ouraihub/hugo` 的 comments partial
4. `keyboard-shortcuts.html`：改为调用 core 的 KeyboardShortcuts 类

---

## hugo-theme-fluid

### 可删除（改用 core）

| 当前文件 | 替换为 | 节省代码 |
|---------|--------|---------|
| `assets/ts/color-schema.ts` | `@ouraihub/core` ThemeManager（需配置 attribute） | ~126 行 |
| 内联代码复制脚本 | `@ouraihub/core` CodeCopyManager | ~80 行 |
| 内联返回顶部脚本 | `@ouraihub/core` BackToTop | ~60 行 |
| `assets/ts/toc.ts` | `@ouraihub/core` TOCHighlighter | ~150 行 |
| `assets/ts/lazyload.ts` | `@ouraihub/core` LazyLoader（已有） | ~348 行 |
| `partials/comments/` (5 种) | `@ouraihub/core` CommentManager | ~200 行 |
| 分享 partials | `@ouraihub/hugo` share partial | ~100 行 |

### 主题自己保留

- Material Design 视觉风格（圆角、阴影、动画）
- Banner 横幅系统
- 标签云动态渲染
- 9 种语言翻译文本
- 插件集成（Fancybox/Mermaid/Math/Typed/NProgress）
- 导航栏下拉 + 滚动隐藏动画
- 移动端侧边栏抽屉

### 重构步骤

1. ThemeManager 集成：配置 `attribute: 'data-user-color-scheme'` 适配 fluid 的切换方式
2. 创建 `ouraihub-mapping.css`：将 `--ui-*` 映射到 `--color-fluid-*`
3. 删除 `lazyload.ts`，改用 core LazyLoader
4. 删除 `toc.ts`，改用 core TOCHighlighter
5. `partials/comments/` 统一为调用 core CommentManager
6. 保留插件集成（Mermaid/Math 等是 fluid 特色，不抽取）

### 特殊注意

- fluid 的暗色模式用 `data-user-color-scheme` 而非 `data-theme`，ThemeManager 需要通过 options 适配
- fluid 有 9 种语言，i18n 翻译文本保留在主题内，只用 core 的 `getLocalizedUrl()` 做 URL 切换

---

## hugowind

### 可删除（改用 core）

| 当前文件 | 替换为 | 节省代码 |
|---------|--------|---------|
| `assets/ts/toggle-theme.ts` + `modules/theme.ts` | `@ouraihub/core` ThemeManager | ~220 行 |
| 内联代码复制 | `@ouraihub/core` CodeCopyManager | ~80 行 |
| 内联返回顶部 | `@ouraihub/core` BackToTop | ~60 行 |
| `assets/ts/modules/nav.ts` 滚动隐藏逻辑 | `@ouraihub/core` NavigationController（已有） | ~100 行 |
| `assets/ts/modules/search.ts` Ctrl+K 部分 | `@ouraihub/core` KeyboardShortcuts + SearchAdapter | ~80 行 |
| `assets/ts/utils/dom.ts` | `@ouraihub/utils` qs/qsa/debounce/throttle（已有） | ~60 行 |

### 主题自己保留

- 企业站组件（Hero/Pricing/CTA/Testimonials/FAQ）
- 三层组件架构（ui/widgets/blog）
- 入场动画系统（IntersectionObserver + CSS transitions）
- Mega menu 导航
- Critical CSS 分离策略
- `--aw-` 命名空间的设计令牌
- 移动端底部导航

### 重构步骤

1. ThemeManager 集成：配置 `attribute: 'class'`，`darkValue: 'dark'` 适配 hugowind 的 `.dark` class 切换
2. 创建 `ouraihub-mapping.css`：将 `--ui-*` 映射到 `--aw-color-*`
3. 删除 `utils/dom.ts`，改用 `@ouraihub/utils`
4. `modules/nav.ts`：保留 mega menu 逻辑，滚动隐藏部分改用 core NavigationController
5. `modules/search.ts`：Ctrl+K 快捷键改用 core KeyboardShortcuts，搜索逻辑改用 SearchAdapter
6. 保留入场动画（是 hugowind 的品牌特色）

### 特殊注意

- hugowind 用 `.dark` class 而非 data attribute，ThemeManager 需要 `attribute: 'class'` 模式
- hugowind 的企业站组件（15 个 Widget）是其核心价值，不抽取到 ui-library

---

## hugo-butterfly

### 可删除（改用 core）

| 功能 | 替换为 |
|------|--------|
| 主题切换 | `@ouraihub/core` ThemeManager |
| 代码复制 | `@ouraihub/core` CodeCopyManager |
| 返回顶部 | `@ouraihub/core` BackToTop |

### 主题自己保留

- 个人博客视觉风格（卡片、标签墙、时间线）
- 侧边栏小组件（最近文章、标签云、归档日历）
- 页面过渡动画

### 重构步骤

1. 集成 ThemeManager + CodeCopyManager + BackToTop
2. 创建 `ouraihub-mapping.css`
3. 其余保持不变（butterfly 功能相对简单）

---

## msgflow-site（Astro）

### 可删除（改用 @ouraihub/astro）

| 当前文件 | 替换为 |
|---------|--------|
| `src/components/islands/CodeCopy.astro` | `@ouraihub/astro` `<CodeCopy />` |
| `src/components/islands/BackToTop.astro` | `@ouraihub/astro` `<BackToTop />` |
| `src/components/ShareLinks.astro` | `@ouraihub/astro` `<ShareLinks />` |
| `src/components/Comments.astro` | `@ouraihub/astro` `<Comments />` |
| `src/components/Icon.astro` + `src/icons.ts` | `@ouraihub/astro` `<Icon />` + `@ouraihub/icons` |
| `src/components/SEO.astro` | `@ouraihub/astro` `<SEO />`（已有） |

### 主题自己保留

- `site.config.yaml` 配置系统
- Header/Footer 布局
- PostCard/PostListItem 文章卡片样式
- 页面路由结构（/articles/[slug]、/en/...）
- i18n 翻译文本
- remark-directive 多媒体嵌入（渲染语法层）
- Pagefind 搜索页面布局
- 代码高亮配置（Shiki dual themes）
- CdnImage 组件（R2 CDN 业务逻辑）
- 响应式布局

### 重构步骤

1. 安装 `@ouraihub/astro` + `@ouraihub/icons` 新版
2. 删除 `islands/CodeCopy.astro`、`islands/BackToTop.astro`，改用 astro 包组件
3. 删除 `ShareLinks.astro`、`Comments.astro`、`Icon.astro`、`icons.ts`，改用 astro 包
4. 保留 Header/Footer/PostCard 等布局组件（这些是主题特色）

---

## astro-nav-monorepo

### 可删除（改用 core）

| 当前文件 | 替换为 |
|---------|--------|
| `packages/website/src/scripts/search.ts` SearchManager | `@ouraihub/core` SearchAdapter（自定义 adapter） |
| `packages/website/src/scripts/lazyLoader.ts` | `@ouraihub/core` LazyLoader（已有） |

### 主题自己保留

- 导航站特有 UI（CategoryCard/NavItem/Sidebar/QRCodeModal）
- 提交页面（/submit）
- Worker API（独立业务逻辑）
- 分类标签页切换
- 数据格式和渲染逻辑

### 重构步骤

1. 删除 `lazyLoader.ts`，改用 core LazyLoader
2. `search.ts`：保留 DOM 操作部分，搜索逻辑改用 SearchAdapter 的 custom adapter
3. 其余保持不变（导航站和博客差异大，共性少）

---

## 集成优先级

| 顺序 | 主题 | 理由 |
|------|------|------|
| 1 | hugo-theme-paper | 已有 mapping 层，集成成本最低，作为参考实现 |
| 2 | msgflow-site | Astro 包的验证场景 |
| 3 | hugo-theme-fluid | 功能最多，验证 core 的完整性 |
| 4 | hugowind | 企业站场景验证 |
| 5 | hugo-butterfly | 最简单，最后做 |
| 6 | astro-nav | 共性最少，只用 LazyLoader + SearchAdapter |
