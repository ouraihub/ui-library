# @ouraihub/svelte 设计文档

## 定位

为 SvelteKit 项目提供开箱即用的 UI 组件，分三层：

1. **@ouraihub/svelte** — 通用组件（包装 core，对齐 astro/hugo 包）
2. **@ouraihub/ai-chat** — AI 交互组件（从 ai-gateway 提取标准化）
3. **@ouraihub/preset-docs-svelte** — 文档站完整模板（SvelteKit）

## 依赖关系

```
产品站 (ouraihub.io / ohagent.io)
  └── @ouraihub/preset-docs-svelte
        ├── @ouraihub/svelte
        │     ├── @ouraihub/core
        │     └── @ouraihub/icons
        └── @ouraihub/ai-chat
              └── @ouraihub/svelte (Icon/Theme)
```

---

## 包 1：@ouraihub/svelte

### 组件列表

| 组件 | Props | 调用 core | 渲染 |
|------|-------|----------|------|
| `<ThemeToggle />` | — | ThemeManager | 按钮 + sun/moon icon |
| `<Icon />` | `name`, `size?`, `class?` | @ouraihub/icons | inline SVG |
| `<CodeCopy />` | `selector?`, `label?` | CodeCopyManager | onMount init |
| `<BackToTop />` | `threshold?` | BackToTop | 固定按钮 + 动画 |
| `<ReadingProgress />` | — | ReadingProgress | 顶部进度条 |
| `<TOC />` | `headings` | TOCHighlighter | 目录列表 |
| `<ShareLinks />` | `url`, `title`, `platforms?` | getShareLinks() | 链接列表 |
| `<Comments />` | `config: CommentConfig` | CommentManager | 容器 div |
| `<Search />` | `provider`, `placeholder?` | SearchAdapter | 搜索框 + 结果 |
| `<KeyboardShortcuts />` | `shortcuts[]` | KeyboardShortcuts | 无 UI（逻辑组件） |
| `<Embed />` | `platform`, `id`, `user?` | getEmbedHtml() | iframe/script |

### 设计原则

1. **Svelte 5 runes** — 使用 `$state`/`$effect`/`$props` 语法
2. **onMount/onDestroy** — 调用 core 的 init/destroy
3. **class prop 透传** — 所有组件支持 `class` 自定义样式
4. **零默认样式** — 只提供结构，样式由消费方或 tokens 控制
5. **SSR 安全** — core 已处理 `typeof window` 检查

### 文件结构

```
packages/svelte/
├── package.json
├── src/
│   ├── index.ts              # 全量导出
│   ├── ThemeToggle.svelte
│   ├── Icon.svelte
│   ├── CodeCopy.svelte
│   ├── BackToTop.svelte
│   ├── ReadingProgress.svelte
│   ├── TOC.svelte
│   ├── ShareLinks.svelte
│   ├── Comments.svelte
│   ├── Search.svelte
│   ├── KeyboardShortcuts.svelte
│   └── Embed.svelte
└── README.md
```

---

## 包 2：@ouraihub/ai-chat

### 来源

从 `ai-gateway` 的 AiChat.svelte 提取，标准化为可复用组件包。

### 组件列表

| 组件 | Props | 说明 |
|------|-------|------|
| `<AiChat />` | `endpoint`, `systemPrompt?`, `model?`, `placeholder?` | 完整聊天界面 |
| `<AiMessage />` | `role`, `content`, `streaming?` | 单条消息（Markdown 渲染） |
| `<AiInput />` | `onSend`, `disabled?`, `placeholder?` | 输入框 + 发送按钮 |
| `<AiEmbed />` | `endpoint`, `systemPrompt?`, `height?` | 嵌入式迷你对话（文档内联） |

### 核心逻辑（不依赖 core，独立实现）

```typescript
// lib/stream.ts — SSE 流式解析
export async function* streamChat(endpoint: string, body: ChatRequest): AsyncGenerator<string>;

// lib/markdown.ts — 轻量 Markdown 渲染（代码块 + 列表 + 加粗）
export function renderMarkdown(text: string): string;
```

### 文件结构

```
packages/ai-chat/
├── package.json
├── src/
│   ├── index.ts
│   ├── AiChat.svelte
│   ├── AiMessage.svelte
│   ├── AiInput.svelte
│   ├── AiEmbed.svelte
│   └── lib/
│       ├── stream.ts         # SSE 流式解析
│       ├── markdown.ts       # Markdown → HTML
│       └── types.ts          # ChatMessage, ChatRequest
└── README.md
```

### AiChat Props 详细设计

```typescript
interface AiChatProps {
  /** API endpoint (e.g. 'https://ai.ouraihub.com/api/ai/chat') */
  endpoint: string;
  /** System prompt preset */
  systemPrompt?: string;
  /** Model name */
  model?: string;
  /** Input placeholder */
  placeholder?: string;
  /** Max messages to keep in context */
  maxHistory?: number;
  /** Turnstile site key (if required) */
  turnstileSiteKey?: string;
  /** Custom CSS class */
  class?: string;
  /** Theme: 'light' | 'dark' | 'auto' */
  theme?: string;
}
```

### 使用示例

```svelte
<!-- 文档站内嵌 AI 对话 -->
<script>
  import { AiEmbed } from '@ouraihub/ai-chat';
</script>

<p>试试和 AI 对话，理解 Prompt Engineering：</p>
<AiEmbed
  endpoint="https://ai.ouraihub.com/api/ai/chat"
  systemPrompt="你是一个 Prompt Engineering 教练..."
  height="400px"
/>
```

---

## 包 3：@ouraihub/preset-docs-svelte

### 定位

`npx degit ouraihub/preset-docs-svelte my-docs` 一键创建文档站。

### 包含

| 文件 | 说明 |
|------|------|
| `DocsLayout.svelte` | 三栏布局（sidebar + content + TOC） |
| `DocSidebar.svelte` | 文档导航树（支持多级折叠） |
| `DocPage.svelte` | 文章页（Markdown + 代码高亮 + CodeCopy） |
| `DocSearch.svelte` | Cmd+K 搜索弹窗 |
| `InteractiveDemo.svelte` | AI 交互演示容器 |
| `+layout.svelte` | SvelteKit 根布局 |
| `mdsvex.config.js` | Markdown 处理配置 |
| `app.css` | 基于 @ouraihub/tokens 的样式 |

### 文件结构

```
packages/preset-docs-svelte/
├── package.json
├── template/                   # degit 模板
│   ├── src/
│   │   ├── routes/
│   │   │   ├── +layout.svelte
│   │   │   └── docs/[...slug]/+page.svelte
│   │   ├── lib/
│   │   │   ├── DocsLayout.svelte
│   │   │   ├── DocSidebar.svelte
│   │   │   ├── DocPage.svelte
│   │   │   ├── DocSearch.svelte
│   │   │   └── InteractiveDemo.svelte
│   │   └── app.css
│   ├── svelte.config.js
│   ├── mdsvex.config.js
│   └── package.json
└── README.md
```

---

## 实施顺序

| 阶段 | 内容 | 前置条件 |
|------|------|---------|
| 1 | `@ouraihub/svelte` 通用组件 | core Phase 2 ✅ |
| 2 | `@ouraihub/ai-chat` AI 组件 | ai-gateway 已有 AiChat.svelte |
| 3 | `@ouraihub/preset-docs-svelte` 模板 | svelte + ai-chat 完成 |
| 4 | ouraihub.io 产品站 | preset-docs-svelte 完成 |

---

## 与 ai-gateway 的关系

```
ai-gateway (Worker)
├── /api/ai/chat          → SSE 流式 API
├── /api/ai/demo/chat     → 公开试用（限流）
└── demo page             → 当前用内联 AiChat.svelte

重构后：
├── Worker API 不变
└── 前端组件迁移到 @ouraihub/ai-chat 包
    ├── ai-gateway demo page import from @ouraihub/ai-chat
    ├── ouraihub.io 教程页 import from @ouraihub/ai-chat
    └── 任何 SvelteKit 项目 import from @ouraihub/ai-chat
```

---

## 暗色模式策略

Svelte 组件通过 `ThemeToggle` 设置 `data-theme` 属性，所有组件用 CSS 变量响应：

```css
/* @ouraihub/tokens 提供 */
:root { --ui-text: #333; --ui-background: #fff; }
[data-theme="dark"] { --ui-text: #eee; --ui-background: #1a1a1a; }
```

AI 组件的暗色模式：
- `AiChat` 读取 `data-theme` 自动切换配色
- 代码块高亮跟随主题（Shiki dual themes）
