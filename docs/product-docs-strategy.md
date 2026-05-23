# 产品文档站规划建议

## 现状问题

当前 nullclaw.io 和 nullhub.io 是两个独立仓库，代码 copy-paste：
- 重复的组件（DocSidebar、DocsLayout、TableOfContents）
- 重复的 markdown.ts 渲染逻辑
- 重复的 CSS 主题系统
- 每次改一个 bug 要改两个仓库

## 建议方案：Monorepo + 共享模板

### 目录结构

```
docs-sites/                    # 或放在各产品仓库的 /docs 目录
├── packages/
│   ├── shared/                # 共享组件和逻辑
│   │   ├── components/
│   │   │   ├── DocSidebar.svelte
│   │   │   ├── DocsLayout.svelte
│   │   │   └── TableOfContents.svelte
│   │   ├── markdown.ts
│   │   ├── styles/
│   │   │   └── docs-base.css  # 基础文档样式
│   │   └── package.json
│   │
│   ├── nullclaw.io/           # NullClaw 文档
│   │   ├── src/
│   │   │   ├── lib/docs/      # Markdown 内容
│   │   │   ├── routes/        # 页面路由
│   │   │   └── app.css        # 品牌配色覆盖
│   │   └── package.json
│   │
│   ├── nullhub.io/            # NullHub 文档
│   │   ├── src/
│   │   │   ├── lib/docs/
│   │   │   ├── routes/
│   │   │   └── app.css
│   │   └── package.json
│   │
│   └── ouraihub.io/           # 未来 OurAIHub 产品文档
│       └── ...
│
├── pnpm-workspace.yaml
└── turbo.json
```

### 或者：独立模板包 + 各站点独立仓库

```
# 发布为 npm 包
@ouraihub/docs-kit
├── components/
├── markdown.ts
├── styles/
└── package.json

# 各站点独立仓库，安装 @ouraihub/docs-kit
nullclaw.io/
├── src/
│   ├── lib/docs/          # 只放内容
│   ├── routes/            # 用 docs-kit 的布局
│   └── app.css            # 品牌配色
└── package.json           # 依赖 @ouraihub/docs-kit
```

## 推荐方案

**短期（现在）：** Monorepo 方案——把 nullclaw.io 和 nullhub.io 合并到一个仓库，shared 包内部复用。

**长期（ui-library Phase 3 完成后）：** 独立模板包方案——`@ouraihub/preset-docs-svelte` 发布到 npm，各站点独立仓库安装使用。

## 新产品文档站的创建流程（长期目标）

```bash
# 1. 用模板创建
npx degit ouraihub/preset-docs-svelte my-product-docs
cd my-product-docs && pnpm install

# 2. 配置品牌
# 编辑 site.config.yaml
site:
  name: "MyProduct"
  tagline: "产品一句话描述"
  repo: "https://github.com/org/repo"
  
theme:
  accent: "#your-brand-color"
  font: "JetBrains Mono"  # 或其他

nav:
  - title: "Getting Started"
    slug: "getting-started"
  - title: "Architecture"
    slug: "architecture"

# 3. 写文档
# 在 src/lib/docs/ 下放 Markdown 文件

# 4. 部署
pnpm run build  # 输出到 build/
# GitHub Pages / Cloudflare Pages / Vercel 自动部署
```

## 各产品文档站的差异化

| 产品 | 品牌色 | 特殊需求 |
|------|--------|---------|
| NullClaw | 绿色荧光（Matrix 风） | CLI 命令参考、API 文档 |
| NullHub | 紫色（Dracula 风） | 多产品导航、生态图 |
| OurAIHub | 蓝色 | 组件 Demo、Playground |
| msgflow | 蓝色 | API 文档、部署指南 |

每个站点只需要覆盖 CSS 变量就能换品牌色，不需要改组件代码。

## 文档站需要的功能清单

| 功能 | 来源 | 实现方式 |
|------|------|---------|
| Markdown 渲染 | shared | marked + highlight.js |
| 代码高亮 | shared | highlight.js（多主题） |
| 侧边栏导航 | shared | DocSidebar 组件 |
| TOC 目录 | shared → core | TOCHighlighter |
| 主题切换 | shared → core | ThemeManager |
| 搜索 | 各站点 | Pagefind 或自定义 |
| 版本切换 | 各站点（如果需要） | 路由前缀 /v1/ /v2/ |
| API 文档 | 各站点 | OpenAPI 渲染或手写 |
| 代码复制 | shared → core | CodeCopyManager |
| 移动端适配 | shared | 响应式 CSS |
| SEO | shared → core | SEOManager |
| 部署 | 各站点 | GitHub Pages workflow |

## 与 ui-library 的集成时间线

```
现在：nullclaw.io / nullhub.io 各自独立，代码重复
  ↓
Phase 2 完成后：core 有 TOCHighlighter / CodeCopyManager
  ↓
创建 @ouraihub/svelte：包装 core 为 Svelte 组件
  ↓
创建 @ouraihub/preset-docs-svelte：完整文档站模板
  ↓
迁移 nullclaw.io / nullhub.io 到新模板
  ↓
新产品文档站直接用模板创建（5 分钟搞定）
```
