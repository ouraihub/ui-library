# @ouraihub/ui-library 重构方案

## 背景

基于对以下项目的源码分析：
- hugo-theme-paper（极简博客）
- hugo-theme-fluid（Material Design 博客）
- hugowind（企业站）
- hugo-butterfly（个人博客）
- astro-nav-monorepo（导航站）
- msgflow-site（内容展示站）

发现大量重复逻辑分散在各项目中，需要统一抽取到 ui-library。

## 当前状态

```
@ouraihub/
├── tokens    → CSS 变量（已完成，已发布 0.1.0）
├── core      → ThemeManager + SEOManager + NavigationController + SearchModal + LazyLoader（部分完成）
├── astro     → SEO 组件（仅一个组件）
├── hugo      → Hugo partials（基础）
├── utils     → qs/qsa/debounce/throttle（已完成）
├── preset-blog → Content schema（基础）
└── preset-docs → 文档预设（基础）
```

## 目标状态

```
@ouraihub/
├── tokens          → 设计令牌（不变）
├── core            → 完整的跨框架逻辑层（大幅扩展）
├── astro           → 完整的 Astro 组件库
├── hugo            → 完整的 Hugo partial 库
├── utils           → 工具函数（扩展）
├── icons           → SVG path 常量（新增，从 core 独立）
├── preset-blog     → 博客预设（扩展）
└── preset-docs     → 文档预设（不变）
```

---

## Phase 2 重构计划（核心逻辑下沉）

### 2.1 @ouraihub/core 新增模块

#### CodeCopyManager

```typescript
// 来源：paper/fluid/hugowind 都有，实现几乎相同
export interface CodeCopyOptions {
  selector?: string;          // 默认 'pre'
  buttonLabel?: string;       // 默认 'Copy'
  copiedLabel?: string;       // 默认 'Copied!'
  copiedTimeout?: number;     // 默认 2000ms
  buttonClass?: string;       // 自定义按钮样式类
}

export class CodeCopyManager {
  constructor(options?: CodeCopyOptions);
  init(): void;               // 扫描并注入按钮
  destroy(): void;            // 移除所有按钮和事件
}
```

#### BackToTop

```typescript
// 来源：paper/fluid/hugowind 都有
export interface BackToTopOptions {
  threshold?: number;         // 显示阈值，默认 0.3（30% 滚动）
  smooth?: boolean;           // 平滑滚动，默认 true
  onShow?: () => void;        // 显示回调（UI 层用来控制动画）
  onHide?: () => void;        // 隐藏回调
}

export class BackToTop {
  constructor(options?: BackToTopOptions);
  init(): void;
  destroy(): void;
  getScrollPercent(): number; // 当前滚动百分比（进度条用）
}
```

#### ShareManager

```typescript
// 来源：paper/fluid/msgflow-site
export interface ShareLink {
  name: string;
  href: string;
  icon: string;               // icon name，对应 @ouraihub/icons
}

export type SharePlatform = 'twitter' | 'facebook' | 'linkedin' | 'telegram' | 'whatsapp' | 'reddit' | 'email';

export function getShareLinks(url: string, title: string, platforms?: SharePlatform[]): ShareLink[];
export function copyLink(url: string): Promise<boolean>;
```

#### CommentManager

```typescript
// 来源：paper(giscus)/fluid(5种)/msgflow-site(3种)
export type CommentProvider = 'giscus' | 'twikoo' | 'waline' | 'utterances' | 'disqus';

export interface CommentConfig {
  provider: CommentProvider;
  giscus?: { repo: string; repoId: string; category: string; categoryId: string; mapping: string; lang: string };
  twikoo?: { envId: string };
  waline?: { serverURL: string };
  utterances?: { repo: string; theme: string };
  disqus?: { shortname: string };
}

export class CommentManager {
  constructor(config: CommentConfig);
  mount(el: HTMLElement): void;           // 挂载到指定元素
  syncTheme(theme: 'light' | 'dark'): void; // 主题跟随
  destroy(): void;
}
```

#### TOCHighlighter

```typescript
// 来源：fluid/hugowind
export interface TOCOptions {
  contentSelector?: string;   // 默认 'article'
  headingSelector?: string;   // 默认 'h2, h3, h4'
  tocSelector?: string;       // 目录容器选择器
  activeClass?: string;       // 默认 'active'
  offset?: number;            // 偏移量
}

export class TOCHighlighter {
  constructor(options?: TOCOptions);
  init(): void;
  destroy(): void;
}
```

#### HeadingLinks

```typescript
// 来源：paper/fluid
export interface HeadingLinksOptions {
  selector?: string;          // 默认 'h2, h3, h4, h5, h6'
  symbol?: string;            // 默认 '#'
  class?: string;             // 链接样式类
}

export function initHeadingLinks(options?: HeadingLinksOptions): void;
```

#### ReadingProgress

```typescript
// 来源：paper
export interface ReadingProgressOptions {
  contentSelector?: string;   // 默认 'article'
  onProgress?: (percent: number) => void; // 进度回调（UI 层用来更新进度条）
}

export class ReadingProgress {
  constructor(options?: ReadingProgressOptions);
  init(): void;
  destroy(): void;
}
```

#### KeyboardShortcuts

```typescript
// 来源：paper/hugowind
export interface Shortcut {
  key: string;                // 'ctrl+k', 'escape', '/'
  handler: () => void;
  description?: string;       // 用于帮助面板
}

export class KeyboardShortcuts {
  register(shortcut: Shortcut): void;
  unregister(key: string): void;
  getAll(): Shortcut[];       // 用于渲染帮助面板
  destroy(): void;
}
```

#### SearchAdapter

```typescript
// 来源：paper(pagefind)/hugowind(pagefind+modal)/astro-nav(自定义)
export interface SearchOptions {
  provider: 'pagefind' | 'custom';
  onResults?: (results: SearchResult[]) => void;
  onError?: (error: string) => void;
}

export interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
}

export class SearchAdapter {
  constructor(options: SearchOptions);
  search(query: string): Promise<SearchResult[]>;
  init(): Promise<boolean>;   // 加载搜索索引
}
```

#### EmbedManager

```typescript
// 来源：msgflow-site(remark-directive) / hugo-theme-paper(shortcode)
// 各平台的 embed URL 拼接规则是通用的，渲染语法各框架自己实现
export type EmbedPlatform = 'youtube' | 'bilibili' | 'vimeo' | 'codepen' | 'twitter' | 'gist';

export interface EmbedOptions {
  id: string;
  user?: string;      // codepen 需要
}

export function getEmbedUrl(platform: EmbedPlatform, options: EmbedOptions): string;
export function getEmbedHtml(platform: EmbedPlatform, options: EmbedOptions): string; // 返回 iframe HTML
```

**注意：代码高亮不放 core。** Hugo 用 Chroma/Shiki 预构建，Astro 用 Shiki 内置，引擎和框架强绑定。core 只管 CodeCopyManager（复制按钮），不管高亮本身。

#### i18n URL 工具

```typescript
// 来源：msgflow-site / hugo-theme-paper / fluid（语言切换菜单都需要）
// 策略对齐业界：Nuxt i18n / Next.js / Astro 的命名和行为
export type LocaleStrategy =
  | 'prefix'                // /en/path — 所有语言都有前缀
  | 'prefix_except_default' // /path (默认语言) + /en/path (其他) — 最常用
  | 'domain';              // en.site.com / fr.site.com

export interface I18nUrlOptions {
  strategy: LocaleStrategy;
  defaultLocale: string;
  locales: string[];
  domains?: Record<string, string>;  // domain 策略时：{ en: 'en.site.com', fr: 'fr.site.com' }
}

export function getLocalizedUrl(url: string, targetLocale: string, options: I18nUrlOptions): string;
export function getCurrentLocale(url: string, options: I18nUrlOptions): string;
export function getAlternateUrls(url: string, options: I18nUrlOptions): { locale: string; url: string }[]; // hreflang 用
```

**注意：菜单/导航组件的 UI 不放 core。** 每个主题的菜单结构、动画、响应式断点完全不同（paper 汉堡菜单、fluid 下拉+滚动隐藏、hugowind mega menu）。core 只提供：
- `NavigationController`（滚动隐藏/显示逻辑，已有）
- `getLocalizedUrl()`（语言切换 URL 生成）

菜单的 HTML 渲染、下拉定位、移动端开关各主题自己实现。

---

### 2.2 @ouraihub/icons（新包）

从 core 独立出来，因为图标数据量大且更新频率不同。

```typescript
// 所有 SVG path 常量
export const ICONS: Record<string, string> = {
  github: '...',
  twitter: '...',
  facebook: '...',
  // ... 所有平台图标
  // ... 功能图标（search, menu, close, sun, moon, copy, arrow-up, rss, ...）
};

export type IconName = keyof typeof ICONS;
export function getIconPath(name: IconName): string;
```

---

### 2.3 @ouraihub/utils 扩展

```typescript
// 新增
export function copyToClipboard(text: string): Promise<boolean>;
export function scrollPercent(): number;
export function onScrollThreshold(threshold: number, callback: (visible: boolean) => void): () => void;
export function prefersReducedMotion(): boolean;
export function isMobile(): boolean;
```

---

## Phase 3 重构计划（框架包完善）

### @ouraihub/astro 完整组件列表

| 组件 | Props | 调用 core |
|------|-------|----------|
| `<SEO />` | meta, og, twitter, schema | SEOManager |
| `<ShareLinks />` | url, title, platforms? | getShareLinks() |
| `<Comments />` | config: CommentConfig | CommentManager |
| `<Icon />` | name: IconName, class? | ICONS |
| `<CodeCopy />` | options? | CodeCopyManager |
| `<BackToTop />` | threshold?, showProgress? | BackToTop |
| `<ReadingProgress />` | — | ReadingProgress |
| `<TOC />` | headings | TOCHighlighter |
| `<ThemeToggle />` | — | ThemeManager |
| `<Search />` | provider, placeholder? | SearchAdapter |
| `<KeyboardShortcuts />` | shortcuts[] | KeyboardShortcuts |

### @ouraihub/hugo 完整 partial 列表

| Partial | 对应 astro 组件 |
|---------|----------------|
| `partials/ouraihub/seo.html` | `<SEO />` |
| `partials/ouraihub/share-links.html` | `<ShareLinks />` |
| `partials/ouraihub/comments.html` | `<Comments />` |
| `partials/ouraihub/code-copy.html` | `<CodeCopy />` |
| `partials/ouraihub/back-to-top.html` | `<BackToTop />` |
| `partials/ouraihub/reading-progress.html` | `<ReadingProgress />` |
| `partials/ouraihub/toc.html` | `<TOC />` |
| `partials/ouraihub/theme-toggle.html` | `<ThemeToggle />` |
| `partials/ouraihub/search.html` | `<Search />` |

---

## 暗色模式兼容策略

各主题使用不同的切换属性：

| 主题 | 属性 | 选择器 |
|------|------|--------|
| paper | `data-theme="dark"` | `html[data-theme="dark"]` |
| fluid | `data-user-color-scheme="dark"` | `[data-user-color-scheme="dark"]` |
| hugowind | `.dark` class | `.dark` |

**解决方案：** ThemeManager 通过 options 适配：

```typescript
const theme = new ThemeManager({
  attribute: 'data-theme',        // paper/msgflow-site
  // attribute: 'class',          // hugowind
  // attribute: 'data-user-color-scheme', // fluid
  darkValue: 'dark',
  lightValue: 'light',
});
```

各主题的映射层（`ouraihub-mapping.css`）负责将 `@ouraihub/tokens` 的变量映射到主题自有变量名。

---

## 实施路线图

| 阶段 | 时间 | 内容 | 产出 |
|------|------|------|------|
| Phase 2a | 1 周 | CodeCopyManager + BackToTop + ShareManager + icons 包 | core 0.2.0 + icons 0.1.0 |
| Phase 2b | 1 周 | CommentManager + TOCHighlighter + HeadingLinks | core 0.3.0 |
| Phase 2c | 1 周 | SearchAdapter + KeyboardShortcuts + ReadingProgress | core 0.4.0 |
| Phase 3a | 1 周 | astro 包完整组件 | astro 0.2.0 |
| Phase 3b | 1 周 | hugo 包完整 partials | hugo 0.2.0 |
| Phase 4 | 2 周 | paper + msgflow-site 集成验证 | 主题更新 |

---

## 设计约束

1. **core 零依赖** — 不依赖任何 npm 包，纯 TS 实现
2. **Tree-shakeable** — 每个模块独立导出，未使用的不打包
3. **SSR 安全** — 所有 DOM 操作包裹在 `typeof window !== 'undefined'` 检查中
4. **< 10KB gzipped** — core 全量打包不超过 10KB
5. **100% 测试覆盖** — 每个模块配套 vitest 单元测试

---

## 从 astro-nav-monorepo 学到的

1. **shared 包模式好** — 类型定义 + 工具函数 + 常量集中管理，website 包只做 UI
2. **类封装模式好** — `SearchManager`、`ClientLazyLoader` 用 class 封装，有 init/destroy 生命周期
3. **配置外置** — `getConfig()` 抛出错误要求消费方实现，不耦合具体配置格式
4. **Turborepo 构建** — 包间依赖自动处理，适合 monorepo

**应用到 ui-library：**
- core 的每个模块都用 class + init/destroy 模式
- 配置通过构造函数 options 传入，不读取任何外部文件
- 用 pnpm workspace + tsup 构建，不需要 Turborepo（包数量少）

---

## 附录：业界方案调研（2026-05-23）

### i18n URL 策略对比

| 框架 | 支持的策略 | 检测顺序 | 持久化 | SEO |
|------|-----------|---------|--------|-----|
| **Nuxt i18n** | `no_prefix` / `prefix_except_default` / `prefix` / `prefix_and_default` / `domain` | pathname → cookie(`i18n_redirected`) → Accept-Language | cookie | `useLocaleHead()` 自动生成 hreflang |
| **Next.js + next-intl** | `always` / `as-needed` / `never` + domain 映射 | pathname → cookie(`NEXT_LOCALE`) → Accept-Language → default | cookie | 需手动添加 hreflang |
| **Astro** | `prefixDefaultLocale: true/false` + domain 映射 | pathname only（静态站无运行时检测） | 无（静态） | `getAbsoluteLocaleUrl()` 辅助生成 |

**结论：** 我们的 `getLocalizedUrl()` 应该支持以下策略（对齐业界）：

```typescript
export type LocaleStrategy =
  | 'prefix'                // /en/path — 所有语言都有前缀
  | 'prefix_except_default' // /path (默认语言) + /en/path (其他) — 最常用
  | 'domain';              // en.site.com / fr.site.com

// 不支持 no_prefix（无法从 URL 判断语言，SEO 不友好）
// 不支持 query param（?lang=en，SEO 不友好，业界已弃用）
```

原来设计的 `strategy: 'prefix' | 'subdomain' | 'query'` 需要修正为：
- `prefix` → 保留
- `subdomain` → 改名为 `domain`（对齐 Nuxt/Next/Astro 命名）
- `query` → **删除**（业界不推荐，SEO 不友好）
- 新增 `prefix_except_default`（最常用的策略）

### Headless UI 组件抽象模式

| 库 | 核心模式 | 样式方案 | 跨框架 |
|---|---------|---------|--------|
| **Radix Primitives** | 零样式 + composable parts（Root/Trigger/Content）+ `asChild`/Slot 合并 props | 消费方自己加 | ❌ 仅 React |
| **Headless UI** | 零样式 + render props + data attributes（`data-open`/`data-active`） | 消费方自己加 | ❌ React + Vue |
| **shadcn/ui** | Radix + Tailwind + 代码生成（copy-paste 到项目里） | Tailwind | ❌ 仅 React |

**关键洞察：**

1. **业界没有真正跨框架的 headless UI 库**——Radix 只有 React，Headless UI 只有 React+Vue。跨框架的做法是"核心逻辑用纯 JS，各框架写薄包装"。

2. **我们的方案（core 纯逻辑 + 框架包薄包装）是正确的**，和 Radix 的思路一致，只是 Radix 把逻辑和 React 渲染耦合了，我们做得更彻底——core 完全不依赖任何框架。

3. **Slot/asChild 模式值得借鉴**——Astro 包的组件可以用类似模式，让消费方自定义渲染元素：
   ```astro
   <!-- 消费方可以传入自定义元素 -->
   <BackToTop as="div" class="my-custom-class" />
   ```

4. **data attributes 模式值得借鉴**——core 的状态变化通过 data attributes 暴露（如 `data-state="open"`），样式层用 CSS 选择器响应，不需要 JS 操作 class。

### 对 refactor-plan 的修正

基于调研，以下设计需要调整：

1. **i18n URL 工具**：
   - 删除 `query` strategy
   - `subdomain` 改名为 `domain`
   - 新增 `prefix_except_default`（最常用）

2. **组件 API 设计**：
   - Astro 包组件支持 `class` prop 透传（对齐 shadcn 模式）
   - core 的状态通过 data attributes 暴露，不操作 className
   - 考虑 `as` prop 让消费方自定义渲染元素

3. **不做的事**：
   - 不做跨框架的 headless 菜单/下拉组件（业界都没做成，复杂度太高）
   - 不做运行时语言检测（静态站不需要，SSR 站各框架有自己的 middleware）
