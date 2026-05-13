# ADR-004: Monorepo 结构设计

**状态**: 已接受  
**日期**: 2026-05-12  
**决策者**: Sisyphus (AI Agent)

---

## 背景

我们需要为 @ouraihub/ui-library 设计包结构，支持：

1. **多个包**: 核心逻辑、样式、Hugo 包装、Astro 包装
2. **跨包复用**: 核心逻辑被所有包装层依赖
3. **独立发布**: 每个包可以独立版本管理
4. **开发体验**: 本地开发时包之间能互相引用
5. **构建效率**: 增量构建，只构建变更的包

**选项**:
1. Monorepo（单仓库多包）
2. Multirepo（多仓库）
3. Monolith（单包）

---

## 决策

我们决定使用 **Monorepo** 结构，采用 **pnpm workspace + Turborepo**：

```
@ouraihub/ui-library/
├── packages/
│   ├── core/              # 核心逻辑（纯 TypeScript）
│   ├── styles/            # 样式系统（CSS 变量 + Tailwind）
│   ├── hugo/              # Hugo 包装层
│   └── astro/             # Astro 包装层
├── pnpm-workspace.yaml    # pnpm workspace 配置
├── turbo.json             # Turborepo 配置
└── package.json           # 根配置
```

---

## 理由

### 1. 包依赖关系清晰

```
@ouraihub/core (核心逻辑)
    ↑
    ├── @ouraihub/hugo (Hugo 包装)
    ├── @ouraihub/astro (Astro 包装)
    └── @ouraihub/styles (样式系统)
```

**优势**:
- ✅ 依赖关系明确（单向依赖）
- ✅ 核心逻辑独立（可单独测试）
- ✅ 包装层轻量（只依赖核心）

---

### 2. pnpm workspace 的优势

**本地开发体验**:
```json
// packages/hugo/package.json
{
  "dependencies": {
    "@ouraihub/core": "workspace:*"
  }
}
```

**优势**:
- ✅ 自动链接本地包（无需 npm link）
- ✅ 类型提示完整（TypeScript 支持）
- ✅ 热更新（修改核心包立即生效）
- ✅ 节省磁盘空间（依赖去重）

**pnpm 的性能优势**:
- ✅ 安装速度快（硬链接）
- ✅ 磁盘占用少（内容寻址存储）
- ✅ 严格的依赖管理（幽灵依赖检测）

---

### 3. Turborepo 的构建优势

**增量构建**:
```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

**优势**:
- ✅ 缓存构建结果（只构建变更的包）
- ✅ 并行构建（多包同时构建）
- ✅ 依赖感知（自动按顺序构建）
- ✅ 远程缓存（团队共享缓存）

**性能对比**:
```bash
# 首次构建
turbo build  # 10s

# 无变更重新构建
turbo build  # 0.1s (缓存命中)

# 只修改 core
turbo build  # 3s (只构建 core + 依赖它的包)
```

---

### 4. 独立版本管理

**语义化版本**:
```json
// packages/core/package.json
{
  "name": "@ouraihub/core",
  "version": "1.2.0"
}

// packages/hugo/package.json
{
  "name": "@ouraihub/hugo",
  "version": "1.1.0",
  "dependencies": {
    "@ouraihub/core": "^1.0.0"
  }
}
```

**优势**:
- ✅ 核心包可以独立升级
- ✅ 包装层可以选择依赖的核心版本
- ✅ 向后兼容性控制

**发布策略**:
```bash
# 发布核心包（破坏性变更）
cd packages/core
npm version major  # 1.2.0 -> 2.0.0
npm publish

# 包装层选择何时升级
cd packages/hugo
# 继续使用 @ouraihub/core@^1.0.0
# 或升级到 @ouraihub/core@^2.0.0
```

---

### 5. 代码共享和复用

**共享配置**:
```
@ouraihub/ui-library/
├── tsconfig.base.json     # 共享 TypeScript 配置
├── .eslintrc.js           # 共享 ESLint 配置
├── vitest.config.ts       # 共享测试配置
└── packages/
    ├── core/
    │   └── tsconfig.json  # 继承 base
    └── hugo/
        └── tsconfig.json  # 继承 base
```

```json
// packages/core/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

**优势**:
- ✅ 配置统一（一处修改全部生效）
- ✅ 减少重复（DRY 原则）
- ✅ 维护简单

---

### 6. 测试和 CI/CD

**统一测试**:
```bash
# 运行所有包的测试
turbo test

# 只测试变更的包
turbo test --filter=...[HEAD^]

# 测试特定包
turbo test --filter=@ouraihub/core
```

**CI/CD 优化**:
```yaml
# .github/workflows/ci.yml
- name: Build
  run: turbo build --filter=...[HEAD^]
  
- name: Test
  run: turbo test --filter=...[HEAD^]
```

**优势**:
- ✅ 只测试变更的包（节省 CI 时间）
- ✅ 并行执行（提高效率）
- ✅ 缓存复用（远程缓存）

---

## 后果

### 正面影响

1. **开发效率**: 本地开发体验好，热更新快
2. **构建性能**: 增量构建，缓存复用
3. **代码复用**: 配置共享，减少重复
4. **版本管理**: 独立版本，灵活控制
5. **团队协作**: 单仓库，易于协作
6. **CI/CD 效率**: 只构建变更，节省时间

### 负面影响

1. **学习曲线**: 需要理解 Monorepo 工具链
2. **工具依赖**: 依赖 pnpm 和 Turborepo
3. **仓库体积**: 单仓库可能变大（但可接受）

### 风险缓解

- **文档**: 提供详细的开发指南
- **脚本**: 提供常用命令的 npm scripts
- **CI/CD**: 自动化构建和测试

---

## 包结构详细设计

### 1. @ouraihub/core（核心包）

**职责**: 纯 TypeScript 逻辑，100% 跨框架复用

```
packages/core/
├── src/
│   ├── theme/
│   │   ├── ThemeManager.ts
│   │   └── types.ts
│   ├── search/
│   │   ├── SearchManager.ts
│   │   └── types.ts
│   └── index.ts
├── tests/
│   └── theme.test.ts
├── package.json
└── tsconfig.json
```

**导出**:
```typescript
// packages/core/src/index.ts
export { ThemeManager } from './theme/ThemeManager';
export { SearchManager } from './search/SearchManager';
export type { Theme, ThemeOptions } from './theme/types';
```

---

### 2. @ouraihub/styles（样式包）

**职责**: CSS 变量、Tailwind 配置、基础样式

```
packages/styles/
├── src/
│   ├── variables.css      # CSS 变量定义
│   ├── base.css           # 基础样式
│   └── index.css          # 入口
├── tailwind.config.js     # Tailwind 配置
├── package.json
└── README.md
```

**导出**:
```css
/* packages/styles/src/index.css */
@import './variables.css';
@import './base.css';
```

---

### 3. @ouraihub/hugo（Hugo 包装）

**职责**: Hugo partials，薄包装层

```
packages/hugo/
├── layouts/
│   └── partials/
│       └── ui/
│           ├── theme-toggle.html
│           ├── search.html
│           └── nav.html
├── assets/
│   └── js/
│       └── init.js        # 自动初始化
├── package.json
└── README.md
```

**使用方式**:
```html
<!-- Hugo 模板 -->
{{ partial "ui/theme-toggle.html" . }}
```

---

### 4. @ouraihub/astro（Astro 包装）

**职责**: Astro 组件，薄包装层

```
packages/astro/
├── src/
│   ├── components/
│   │   ├── ThemeToggle.astro
│   │   ├── Search.astro
│   │   └── Nav.astro
│   └── index.ts
├── package.json
└── README.md
```

**使用方式**:
```astro
---
import { ThemeToggle } from '@ouraihub/astro';
---
<ThemeToggle />
```

---

## 替代方案

### 方案 A: Multirepo（多仓库）

**描述**: 每个包一个独立仓库

**优点**:
- ✅ 完全独立（版本、CI/CD）
- ✅ 权限控制细粒度

**缺点**:
- ❌ 跨包修改困难（需要多个 PR）
- ❌ 本地开发体验差（需要 npm link）
- ❌ 配置重复（每个仓库都要配置）
- ❌ 版本同步困难

**为什么没选**: 开发体验差，维护成本高。

---

### 方案 B: Monolith（单包）

**描述**: 所有代码在一个包中

**优点**:
- ✅ 简单（无需 Monorepo 工具）
- ✅ 无依赖管理

**缺点**:
- ❌ 无法独立发布（用户必须安装全部）
- ❌ 包体积大（即使只用一个功能）
- ❌ 职责不清晰（核心和包装混在一起）

**为什么没选**: 违背了混合架构的设计原则。

---

### 方案 C: Monorepo（已选择）

**描述**: pnpm workspace + Turborepo

**优点**:
- ✅ 开发体验好
- ✅ 构建性能高
- ✅ 独立发布
- ✅ 职责清晰

**缺点**:
- ⚠️ 需要学习工具链

**为什么选择**: 在开发体验、性能、灵活性之间取得最佳平衡。

---

## 实施计划

### Phase 1: 基础设施

```bash
# 1. 初始化 Monorepo
pnpm init
mkdir -p packages/{core,styles,hugo,astro}

# 2. 配置 workspace
cat > pnpm-workspace.yaml << EOF
packages:
  - 'packages/*'
EOF

# 3. 安装 Turborepo
pnpm add -Dw turbo

# 4. 配置 Turborepo
cat > turbo.json << EOF
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
EOF
```

### Phase 2: 创建包

```bash
# 1. 创建核心包
cd packages/core
pnpm init
pnpm add -D typescript vitest

# 2. 创建样式包
cd ../styles
pnpm init
pnpm add -D tailwindcss

# 3. 创建 Hugo 包
cd ../hugo
pnpm init
pnpm add @ouraihub/core@workspace:*

# 4. 创建 Astro 包
cd ../astro
pnpm init
pnpm add @ouraihub/core@workspace:*
```

### Phase 3: 配置共享

```bash
# 1. 共享 TypeScript 配置
cat > tsconfig.base.json << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true
  }
}
EOF

# 2. 共享 ESLint 配置
cat > .eslintrc.js << EOF
module.exports = {
  extends: ['eslint:recommended'],
  env: { es2020: true }
};
EOF
```

---

## 相关决策

- [ADR-001: 混合架构](./001-hybrid-architecture.md) - 整体架构设计
- [ADR-002: 不使用 Web Components](./002-no-web-components.md) - 为什么不用 Web Components
- [ADR-003: CSS 变量 vs CSS-in-JS](./003-css-variables-over-css-in-js.md) - 样式方案选择

---

## 参考资料

- [pnpm Workspace](https://pnpm.io/workspaces)
- [Turborepo 文档](https://turbo.build/repo/docs)
- [Monorepo 最佳实践](https://monorepo.tools/)
- [完整设计方案](../DESIGN.md)

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-12
