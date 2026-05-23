# ui-library Phase 2 实施计划

## 目标

将 msgflow-site、hugo-theme-paper、hugowind 中重复的前端逻辑下沉到 `@ouraihub/core`，实现跨框架复用。

## 当前状态

core 已有：ThemeManager、SEOManager、NavigationController、SearchModal、LazyLoader、Logger

core 缺失（本次要做的）：

| 模块 | 参考来源 | 复杂度 |
|------|---------|--------|
| CodeCopyManager | paper/attachCopyButtons + msgflow-site/CodeCopy | 低 |
| BackToTop | paper/backToTop + msgflow-site/BackToTop | 低 |
| ShareManager | msgflow-site/ShareLinks | 低 |
| CommentManager | msgflow-site/Comments (Giscus/Twikoo/Waline) | 中 |
| TOCHighlighter | fluid/hugowind 的 TOC 高亮 | 中 |
| HeadingLinks | paper/addHeadingLinks | 低 |
| ReadingProgress | paper/createProgressBar + updateScrollProgress | 低 |
| SearchAdapter | 统一 Pagefind/自定义搜索的接口 | 中 |

新增包：

| 包 | 说明 |
|---|------|
| @ouraihub/icons | SVG path 常量集合（从 msgflow-site/icons.ts 提取） |

## 实施顺序

### Batch 1：简单模块（无外部依赖，纯 DOM 操作）

1. **CodeCopyManager** — 找 pre 块，注入复制按钮，clipboard API
2. **BackToTop** — 滚动监听，显隐控制，scrollTo
3. **HeadingLinks** — 给 h2-h6 注入锚点链接
4. **ReadingProgress** — 滚动百分比计算，更新进度条宽度

### Batch 2：数据生成模块（纯函数，无 DOM）

5. **ShareManager** — `getShareLinks(url, title)` → 平台链接数组
6. **@ouraihub/icons** — SVG path 常量包

### Batch 3：复杂模块（外部脚本加载 + 多 provider）

7. **CommentManager** — 统一接口，支持 Giscus/Twikoo/Waline，主题同步
8. **TOCHighlighter** — IntersectionObserver 监听标题，高亮当前 TOC 项
9. **SearchAdapter** — 统一搜索接口，Pagefind adapter + 自定义 adapter
10. **KeyboardShortcuts** — 快捷键注册/注销/帮助面板数据
11. **EmbedManager** — embed URL/HTML 生成（YouTube/Bilibili/Vimeo/CodePen/Twitter/Gist）
12. **i18n URL 工具** — getLocalizedUrl/getAlternateUrls（prefix/prefix_except_default/domain 策略）

## 每个模块的设计约束

1. **纯 TypeScript**，无框架依赖，零 npm 依赖
2. **class + init/destroy 生命周期**（或纯函数，视模块性质）
3. **Options 接口**，所有配置可选（有合理默认值）
4. **不创建 HTML 结构**（只操作已有 DOM 或返回数据）
5. **SSR 安全** — DOM 操作包裹 `typeof window !== 'undefined'`
6. **状态通过 data attributes 暴露**（如 `data-state="visible"`），不操作 className
7. **100% 测试覆盖**（vitest + jsdom）
8. **tree-shakeable**（独立导出，不强制全量引入）
9. **< 10KB gzipped**（core 全量打包）

## API 设计（详见 refactor-plan.md 完整签名）

关键接口摘要：

```typescript
// CodeCopyManager
class CodeCopyManager { constructor(options?: CodeCopyOptions); init(); destroy(); }

// BackToTop
class BackToTop { constructor(options?: BackToTopOptions); init(); destroy(); getScrollPercent(): number; }

// ShareManager (纯函数)
function getShareLinks(url: string, title: string, platforms?: SharePlatform[]): ShareLink[];
function copyLink(url: string): Promise<boolean>;

// CommentManager
class CommentManager { constructor(config: CommentConfig); mount(el: HTMLElement); syncTheme(theme); destroy(); }

// TOCHighlighter
class TOCHighlighter { constructor(options?: TOCOptions); init(); destroy(); }

// HeadingLinks (纯函数)
function initHeadingLinks(options?: HeadingLinksOptions): void;

// ReadingProgress
class ReadingProgress { constructor(options?: ReadingProgressOptions); init(); destroy(); }

// KeyboardShortcuts
class KeyboardShortcuts { register(shortcut); unregister(key); getAll(); destroy(); }

// SearchAdapter
class SearchAdapter { constructor(options: SearchOptions); init(): Promise<boolean>; search(query): Promise<SearchResult[]>; }

// EmbedManager (纯函数)
function getEmbedUrl(platform: EmbedPlatform, options: EmbedOptions): string;

// i18n URL (纯函数)
function getLocalizedUrl(url: string, targetLocale: string, options: I18nUrlOptions): string;
function getAlternateUrls(url: string, options: I18nUrlOptions): { locale: string; url: string }[];
```

## 文件结构

```
packages/core/src/
├── code-copy/
│   ├── index.ts
│   ├── CodeCopyManager.ts
│   └── types.ts
├── back-to-top/
│   ├── index.ts
│   ├── BackToTop.ts
│   └── types.ts
├── heading-links/
│   ├── index.ts
│   ├── HeadingLinks.ts
│   └── types.ts
├── reading-progress/
│   ├── index.ts
│   ├── ReadingProgress.ts
│   └── types.ts
├── share/
│   ├── index.ts
│   ├── ShareManager.ts
│   └── types.ts
├── comments/
│   ├── index.ts
│   ├── CommentManager.ts
│   ├── providers/
│   │   ├── giscus.ts
│   │   ├── twikoo.ts
│   │   └── waline.ts
│   └── types.ts
├── toc/
│   ├── index.ts
│   ├── TOCHighlighter.ts
│   └── types.ts
└── search-adapter/
    ├── index.ts
    ├── SearchAdapter.ts
    ├── adapters/
    │   ├── pagefind.ts
    │   └── custom.ts
    └── types.ts

packages/icons/
├── package.json
├── src/
│   ├── index.ts        # 全量导出
│   ├── social.ts       # twitter/facebook/linkedin/telegram...
│   ├── ui.ts           # arrow/close/menu/search/copy/check...
│   └── types.ts
└── README.md
```

## 验收标准

- [ ] `pnpm build` 全包通过
- [ ] `pnpm test` 全部绿色
- [ ] 每个模块有 README 和 API 文档
- [ ] 无循环依赖（`scripts/check-circular-deps.js` 通过）
- [ ] 从 msgflow-site 或 paper 中实际替换一个模块验证可用性
