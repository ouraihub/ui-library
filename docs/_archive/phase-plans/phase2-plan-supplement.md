# phase2-plan 补充说明

基于 refactor-plan.md 的分析和业界调研，以下模块建议补充到 Phase 2 计划中。

## 新增模块（phase2-plan 未覆盖）

### 1. i18n URL 工具（Batch 2，纯函数）

```typescript
// packages/core/src/i18n/
export type LocaleStrategy = 'prefix' | 'prefix_except_default' | 'domain';

export function getLocalizedUrl(url: string, targetLocale: string, options: I18nUrlOptions): string;
export function getCurrentLocale(url: string, options: I18nUrlOptions): string;
export function getAlternateUrls(url: string, options: I18nUrlOptions): { locale: string; url: string }[];
```

**来源：** msgflow-site / paper / fluid 的语言切换都需要。
**调研结论：** 删除 query 策略（SEO 不友好），对齐 Nuxt/Next/Astro 的 `prefix_except_default` 命名。

### 2. EmbedManager（Batch 2，纯函数）

```typescript
// packages/core/src/embed/
export type EmbedPlatform = 'youtube' | 'bilibili' | 'vimeo' | 'codepen' | 'twitter' | 'gist';

export function getEmbedUrl(platform: EmbedPlatform, options: { id: string; user?: string }): string;
export function getEmbedHtml(platform: EmbedPlatform, options: { id: string; user?: string }): string;
```

**来源：** msgflow-site 的 remark-directive 插件 / hugo-theme-paper 的 shortcode。
**说明：** URL 拼接规则跨框架通用，渲染语法各主题自己实现。

### 3. KeyboardShortcuts（Batch 3，DOM 操作）

```typescript
// packages/core/src/keyboard-shortcuts/
export interface Shortcut {
  key: string;          // 'ctrl+k', 'escape', '/'
  handler: () => void;
  description?: string;
}

export class KeyboardShortcuts {
  register(shortcut: Shortcut): void;
  unregister(key: string): void;
  getAll(): Shortcut[];
  destroy(): void;
}
```

**来源：** paper 的 keyboard-shortcuts.html + hugowind 的 Ctrl+K 搜索。

## 设计修正（基于业界调研）

### i18n 策略

原来考虑的 `query` 策略（`?lang=en`）应删除：
- Nuxt/Next/Astro 都不推荐
- Google 对 query param 的 hreflang 支持不好
- 业界标准是 prefix 或 domain

### 组件 API 设计建议

借鉴 Radix/shadcn 的模式：

1. **状态通过 data attributes 暴露**（不操作 className）
   ```typescript
   // BackToTop 显示时设置 data-visible="true"
   // 样式层用 [data-visible="true"] { opacity: 1 } 响应
   ```

2. **Astro 包组件支持 class prop 透传**
   ```astro
   <BackToTop class="my-custom-class" />
   ```

3. **不做跨框架 headless 菜单组件**
   - 业界（Radix/Headless UI）都没做成真正跨框架的
   - 菜单 UI 差异太大，各主题自己实现更合理

## 文件结构补充

```
packages/core/src/
├── ... (phase2-plan 已有的)
├── i18n/
│   ├── index.ts
│   ├── url.ts           # getLocalizedUrl / getCurrentLocale / getAlternateUrls
│   └── types.ts
├── embed/
│   ├── index.ts
│   ├── EmbedManager.ts  # getEmbedUrl / getEmbedHtml
│   └── types.ts
└── keyboard-shortcuts/
    ├── index.ts
    ├── KeyboardShortcuts.ts
    └── types.ts
```

## 优先级调整建议

| Batch | 原计划 | 补充 |
|-------|--------|------|
| Batch 2 | ShareManager + icons | + i18n URL 工具 + EmbedManager |
| Batch 3 | CommentManager + TOC + SearchAdapter | + KeyboardShortcuts |

## 移动端/响应式支持

**结论：各主题自己实现，不放 ui-library。**

### 理由

1. 响应式布局是纯 CSS 层的事（断点、栅格、flex/grid 切换），和框架无关
2. 每个主题的移动端设计差异极大：
   - paper：单栏极简，汉堡菜单展开为全屏列表
   - fluid：侧边栏抽屉 + 底部 TOC 面板
   - hugowind：底部固定导航 + 折叠 Hero
   - astro-nav：标签页切换 + 搜索置顶
3. 没有可抽取的通用"逻辑"——响应式是样式问题，不是行为问题

### ui-library 提供的（仅限）

| 包 | 内容 | 说明 |
|---|------|------|
| `@ouraihub/tokens` | 断点变量 | `--breakpoint-sm: 640px` / `--breakpoint-md: 768px` / `--breakpoint-lg: 1024px` |
| `@ouraihub/utils` | `isMobile()` | 检测视口宽度是否 < sm 断点 |
| `@ouraihub/utils` | `onBreakpointChange(bp, cb)` | 监听断点变化（MediaQueryList） |

### 主题自己负责的

- 布局切换（单栏/双栏/侧边栏）
- 移动端菜单（汉堡/抽屉/底部 tab）
- 触摸手势（滑动关闭菜单等）
- 图片/表格在小屏的适配
- 字体大小响应式调整
