# AGENTS.md

ui-library — 跨框架前端组件库（monorepo）。

## 开发

```bash
pnpm install
pnpm build           # 构建所有包
pnpm test            # 跑测试
pnpm lint            # lint
```

## 文件放置规范（严格遵守）

**白名单制 — 只允许在以下位置创建/修改文件：**

| 路径 | 允许放什么 |
|------|-----------|
| `packages/<pkg>/src/` | 包的源码 |
| `packages/<pkg>/tests/` | 包的测试 |
| `docs/` | 项目文档（Markdown） |
| `scripts/` | 构建/发布脚本 |
| `examples/` | 使用示例 |
| `test/` | 集成测试 |
| 根目录 | 仅下方列出的配置文件 |

**已有的 packages（不得新增包，除非明确要求）：**

```
packages/
├── core/           # 核心 JS 模块（框架无关）
├── tokens/         # 设计 token
├── icons/          # SVG 图标
├── utils/          # 通用工具函数
├── astro/          # Astro 组件
├── svelte/         # Svelte 组件
├── hugo/           # Hugo partials
├── ai-chat/        # AI 聊天组件
├── preset-blog/    # 博客预设
├── preset-docs/    # 文档站预设
└── theme-bridge/   # 主题桥接层
```

**根目录允许的文件（完整列表，不得新增）：**

```
README.md
AGENTS.md
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
turbo.json
tsconfig.json
.gitignore
.changeset/
.github/
.husky/
```

**绝对禁止：**

- ❌ 在根目录创建新文件夹
- ❌ 创建新 package（除非明确要求并讨论）
- ❌ 在 `packages/` 外放源码
- ❌ 在 package 内创建 `src/` 之外的源码目录
- ❌ 创建 `.js` 文件（用 `.ts` / `.mjs`）

**新增组件的正确流程：**

1. 确定属于哪个 package（core? astro? svelte?）
2. 在该 package 的 `src/` 下创建文件
3. 在 package 的 `index.ts` 中导出
4. 在 `tests/` 下添加测试

## 代码规范

- TypeScript strict
- 每个 package 独立 `package.json`
- 用 changeset 管理版本
- core 包不依赖任何框架
- 框架包（astro/svelte/hugo）只依赖 core + tokens
