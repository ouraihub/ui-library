# @ouraihub/ui-library

> 可复用组件库，为 Hugo 主题和 Astro 项目设计

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![pnpm](https://img.shields.io/badge/pnpm-8.0-orange.svg)](https://pnpm.io/)

## 简介

**@ouraihub/ui-library** 是一个为多个前端项目（Hugo 主题和 Astro 项目）设计的可复用组件库。通过提取 ~2,850-4,000 行重复代码，实现 70%+ 代码复用，降低 75% 维护成本。

### 核心特点

- 🎯 **混合架构** - 核心逻辑用纯 TypeScript 类（100% 复用），UI 层用框架专用薄包装
- 🚫 **不使用 Web Components** - 针对 SSG + Tailwind v4 场景优化，SEO 友好
- 📦 **Monorepo 结构** - pnpm workspace + Turborepo，支持增量构建
- ⚡ **快速上手** - 30 分钟创建第一个可复用组件
- 🔒 **类型安全** - 100% TypeScript 覆盖，strict 模式
- 🧪 **测试完善** - 单元测试 + 集成测试 + E2E 测试

### 预期收益

- **代码复用**: 节省 ~2,000-2,800 行代码（70%+）
- **维护成本**: 降低 75%（修复一次，全部生效）
- **开发效率**: 提升 300%（实现一次，多处复用）
- **一致性**: 统一实现，统一体验

## 快速开始

### 安装

```bash
# 使用 npm
npm install @ouraihub/core @ouraihub/tokens

# 使用 pnpm
pnpm add @ouraihub/core @ouraihub/tokens

# 使用 yarn
yarn add @ouraihub/core @ouraihub/tokens
```

### 30 秒示例

```typescript
import { ThemeManager } from '@ouraihub/core/theme';

// 创建主题管理器
const theme = new ThemeManager({
  storageKey: 'theme',
  defaultTheme: 'system'
});

// 切换主题
document.querySelector('#theme-toggle')?.addEventListener('click', () => {
  theme.toggle();
});
```

### Hugo 主题使用

```html
<!-- 1. 引入 CSS -->
<link rel="stylesheet" href="@ouraihub/tokens/css">

<!-- 2. 使用组件 -->
<button data-ui-component="theme-toggle">
  <span class="light-icon">☀️</span>
  <span class="dark-icon">🌙</span>
</button>

<!-- 3. 自动初始化 -->
<script type="module">
  import { ThemeManager } from '@ouraihub/core/theme';
  
  document.querySelectorAll('[data-ui-component="theme-toggle"]')
    .forEach(el => new ThemeManager(el));
</script>
```

### Astro 项目使用

```astro
---
import '@ouraihub/tokens/css';
---

<button id="theme-toggle">
  <span class="light-icon">☀️</span>
  <span class="dark-icon">🌙</span>
</button>

<script>
  import { ThemeManager } from '@ouraihub/core/theme';
  
  const button = document.getElementById('theme-toggle');
  if (button) {
    new ThemeManager(button);
  }
</script>
```

## 包列表

### 核心包

| 包名 | 描述 | 版本 |
|------|------|------|
| [@ouraihub/core](./packages/core) | 核心逻辑层（纯 TypeScript 类） | 0.1.0 |
| [@ouraihub/tokens](./packages/tokens) | 设计令牌和 Tailwind 预设 | 0.1.0 |
| [@ouraihub/utils](./packages/utils) | 工具函数库 | 0.1.0 |

### 框架包装

| 包名 | 描述 | 版本 |
|------|------|------|
| [@ouraihub/hugo](./packages/hugo) | Hugo 组件包装层 | 0.1.0 |
| [@ouraihub/astro](./packages/astro) | Astro 组件包装层 | 0.1.0 |

### 预设和主题

| 包名 | 描述 | 版本 |
|------|------|------|
| [@ouraihub/preset-blog](./packages/preset-blog) | 博客预设 | 0.1.0 |
| [@ouraihub/preset-docs](./packages/preset-docs) | 文档预设 | 0.1.0 |

## 功能特性

### 已实现 ✅

- **ThemeManager** - 主题切换系统
  - light/dark/system 三态切换
  - localStorage 持久化
  - 媒体查询监听
  - 防闪烁机制
  - 事件通知系统

### 开发中 🔄

- **DOM 工具函数** - querySelector 封装、debounce/throttle
- **CSS 变量系统** - 统一设计令牌、暗色主题支持
- **单元测试** - 核心逻辑测试覆盖

### 计划中 📋

- **NavigationController** - 导航菜单控制
- **LazyLoader** - 图片懒加载
- **SearchModal** - 搜索功能
- **SEO 组件** - Meta 标签、Open Graph
- **表单验证** - URL、Email 验证

## 架构设计

### 六层架构

```
Layer 6: Ecosystem（生态系统层）- CLI、VSCode 扩展
    ↓
Layer 5: Themes（完整主题层）- 开箱即用的主题
    ↓
Layer 4: Presets（预设层）- 配置 + 插件组合
    ↓
Layer 3: Framework Base（框架基础层）- 布局和样式系统
    ↓
Layer 2: Components（组件包装层）- Hugo/Astro 组件
    ↓
Layer 1: Primitives（核心原语层）- 纯 TypeScript 类
    ↓
Layer 0: Design Tokens（设计令牌层）- 颜色、间距、字体
```

### 目录结构

```
@ouraihub/ui-library/
├── packages/
│   ├── tokens/         # Layer 0: 设计令牌
│   ├── core/           # Layer 1: 核心原语
│   ├── utils/          # Layer 1: 工具函数
│   ├── hugo/           # Layer 2: Hugo 组件
│   ├── astro/          # Layer 2: Astro 组件
│   ├── preset-blog/    # Layer 4: 博客预设
│   └── preset-docs/    # Layer 4: 文档预设
├── docs/               # 完整设计文档
├── CLAUDE.md           # AI 助手项目指南
└── README.md           # 本文件
```

**核心理念**: 核心逻辑 100% 复用，UI 层薄包装适配各框架。

## 文档

### 快速导航

- 📖 [文档索引](docs/README.md) - 完整文档导航
- 🚀 [快速开始指南](docs/implementation/02-quick-start.md) - 30 分钟创建第一个组件
- ⭐ [完整设计方案](docs/DESIGN.md) - 技术方案和架构设计
- 🤖 [CLAUDE.md](CLAUDE.md) - AI 助手项目指南

### 架构决策（ADR）

- 🏗️ [ADR-001: 混合架构](docs/decisions/001-hybrid-architecture.md) - 为什么选择混合架构
- 🚫 [ADR-002: 不使用 Web Components](docs/decisions/002-no-web-components.md) - Web Components 的权衡
- 🎨 [ADR-003: CSS 变量方案](docs/decisions/003-css-variables-over-css-in-js.md) - 样式系统选择
- 📦 [ADR-004: Monorepo 结构](docs/decisions/004-monorepo-structure.md) - 包结构设计
- 🏛️ [ADR-005: 六层架构](docs/decisions/005-six-layer-architecture.md) - 六层架构设计

### 开发指南

- 📝 [代码规范](docs/guides/code-style.md) - TypeScript、CSS、命名约定
- 🔧 [API 参考](docs/api/README.md) - 核心类和工具函数 API
- 🧪 [测试策略](docs/testing/README.md) - 测试金字塔和覆盖率目标
- 🚀 [部署指南](docs/deployment/README.md) - npm 发布和 CI/CD
- 🔒 [安全性](docs/guides/security.md) - XSS 防护、输入验证
- ⚡ [性能优化](docs/guides/performance.md) - 包体积、代码分割
- 🔧 [故障排查](docs/guides/troubleshooting.md) - 常见问题和调试技巧

## 开发

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
# 克隆仓库
git clone https://github.com/ouraihub/ui-library.git
cd ui-library

# 安装依赖
pnpm install
```

### 常用命令

```bash
# 构建所有包
pnpm build

# 开发模式（watch）
pnpm dev

# 运行测试
pnpm test

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint

# 清理构建产物
pnpm clean

# 检查循环依赖
pnpm check:circular
```

### 开发新组件

1. 在 `packages/core/src/` 中实现核心逻辑
2. 编写单元测试（覆盖率 > 80%）
3. 在 `packages/hugo/` 和 `packages/astro/` 中创建薄包装
4. 更新 API 文档和使用示例
5. 运行测试和类型检查

## 项目状态

**当前阶段**: 🚀 初始实现阶段

**已完成**:
- ✅ 项目分析和代码重复识别
- ✅ 架构设计和技术选型
- ✅ 完整文档体系（28+ 文档）
- ✅ Monorepo 基础结构
- ✅ ThemeManager 核心实现

**进行中**:
- 🔄 DOM 工具函数实现
- 🔄 CSS 变量系统
- 🔄 单元测试编写

**下一步**:
- 📋 NavigationController 实现
- 📋 LazyLoader 实现
- 📋 Hugo 和 Astro 包装层

## 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支（`git checkout -b feature/amazing-feature`）
3. 提交更改（`git commit -m 'feat: add amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 创建 Pull Request

### Commit 规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**示例**:
```
feat(core): 添加 ThemeManager 类

- 实现 light/dark/system 三态切换
- 添加 localStorage 持久化
- 添加媒体查询监听

Closes #123
```

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- **文档维护**: Sisyphus (AI Agent)
- **项目版本**: v0.1.0
- **最后更新**: 2026-05-13
- **仓库**: [github.com/ouraihub/ui-library](https://github.com/ouraihub/ui-library)

## 致谢

本项目受以下项目启发：

- [Pagefind](https://pagefind.app/) - 架构设计和事件系统
- [Radix UI](https://www.radix-ui.com/) - 组件 API 设计
- [Shadcn/ui](https://ui.shadcn.com/) - 文档和开发者体验

---

**准备好开始了吗？查看 [快速开始指南](docs/implementation/02-quick-start.md)！** 🎉
