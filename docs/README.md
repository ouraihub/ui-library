# @ouraihub/ui-library 文档

多框架可复用组件库，核心逻辑用纯 TypeScript，UI 层用框架专用薄包装（Astro/Hugo/Svelte）。

## 文档结构

```
docs/
├── api/                    # 各 core 模块 API 参考
├── architecture/           # 架构研究与设计
├── decisions/              # ADR 架构决策记录
├── guides/                 # 开发指南（代码风格、错误处理、性能、安全、迁移）
├── testing/                # 测试策略
├── security/               # 安全规范
├── compatibility/          # 浏览器兼容性
├── npm-publish-setup.md    # CI 发布到 npm 的配置指南
└── theme-development-guide.md  # 基于 ui-library 开发新主题
```

## 包一览

| 包 | 说明 |
|----|------|
| `@ouraihub/core` | 纯 TS 核心逻辑（ThemeManager, SEO, Search, TOC 等 13 个模块） |
| `@ouraihub/icons` | SVG path 常量（social + ui） |
| `@ouraihub/tokens` | 设计令牌 |
| `@ouraihub/astro` | Astro 组件（11 个） |
| `@ouraihub/svelte` | Svelte 5 组件 |
| `@ouraihub/hugo` | Hugo partials + data-controller JS 入口 |
| `@ouraihub/theme-bridge` | DaisyUI 主题桥接 |
| `@ouraihub/preset-blog` | 博客预设配置 |
| `@ouraihub/preset-docs` | 文档站预设配置 |
| `@ouraihub/preset-docs-svelte` | SvelteKit 文档站模板（degit） |
| `@ouraihub/ai-chat` | AI 聊天组件 |

## 快速开始

```bash
pnpm install
pnpm build
pnpm test
```

## 相关链接

- [npm-publish-setup.md](./npm-publish-setup.md) — CI 发布配置
- [theme-development-guide.md](./theme-development-guide.md) — 开发新主题
- [decisions/](./decisions/) — 为什么这样设计
- [api/](./api/) — 各模块 API 文档
