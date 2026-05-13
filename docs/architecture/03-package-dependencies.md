# 包依赖关系图

> **版本**: 1.0.0  
> **最后更新**: 2026-05-12  
> **维护者**: Sisyphus (AI Agent)

## 概述

本文档定义了 @ouraihub/ui-library Monorepo 中所有包的依赖关系，确保：
- 无循环依赖
- 清晰的构建顺序
- 明确的版本管理策略

---

## 包依赖关系图

### 完整依赖图

```mermaid
graph TD
    %% Layer 0: Design Tokens
    tokens[@ouraihub/tokens<br/>Layer 0: Design Tokens]
    
    %% Layer 1: Primitives
    utils[@ouraihub/utils<br/>Layer 1: Utils]
    core[@ouraihub/core<br/>Layer 1: Core Primitives]
    
    %% Layer 2: Components
    hugo[@ouraihub/hugo<br/>Layer 2: Hugo Components]
    astro[@ouraihub/astro<br/>Layer 2: Astro Components]
    
    %% Layer 3: Framework Base
    hugoBase[@ouraihub/hugo-base<br/>Layer 3: Hugo Framework Base]
    astroBase[@ouraihub/astro-base<br/>Layer 3: Astro Framework Base]
    
    %% Layer 4: Presets
    presetBlog[@ouraihub/preset-blog<br/>Layer 4: Blog Preset]
    presetDocs[@ouraihub/preset-docs<br/>Layer 4: Docs Preset]
    
    %% Layer 5: Themes
    hugoThemeBlog[@ouraihub/hugo-theme-blog<br/>Layer 5: Hugo Blog Theme]
    astroThemeDocs[@ouraihub/astro-theme-docs<br/>Layer 5: Astro Docs Theme]
    
    %% Layer 6: Ecosystem
    cli[@ouraihub/cli<br/>Layer 6: CLI Tool]
    
    %% 依赖关系
    tokens --> core
    utils --> core
    
    core --> hugo
    core --> astro
    tokens --> hugo
    tokens --> astro
    
    hugo --> hugoBase
    astro --> astroBase
    tokens --> hugoBase
    tokens --> astroBase
    
    hugoBase --> presetBlog
    astroBase --> presetDocs
    tokens --> presetBlog
    tokens --> presetDocs
    
    presetBlog --> hugoThemeBlog
    presetDocs --> astroThemeDocs
    
    core --> cli
    hugo --> cli
    astro --> cli
    tokens --> cli
    
    %% 样式
    classDef layer0 fill:#fbbf24,stroke:#f59e0b,color:#000
    classDef layer1 fill:#4ade80,stroke:#22c55e,color:#000
    classDef layer2 fill:#60a5fa,stroke:#3b82f6,color:#fff
    classDef layer3 fill:#a78bfa,stroke:#8b5cf6,color:#fff
    classDef layer4 fill:#fb923c,stroke:#f97316,color:#000
    classDef layer5 fill:#ec4899,stroke:#db2777,color:#fff
    classDef layer6 fill:#8b5cf6,stroke:#7c3aed,color:#fff
    
    class tokens layer0
    class utils,core layer1
    class hugo,astro layer2
    class hugoBase,astroBase layer3
    class presetBlog,presetDocs layer4
    class hugoThemeBlog,astroThemeDocs layer5
    class cli layer6
```

---

## 构建顺序

### Level 0: 无依赖（可并行）
```
@ouraihub/tokens
@ouraihub/utils
```

### Level 1: 依赖 Level 0（可并行）
```
@ouraihub/core (依赖: tokens, utils)
```

### Level 2: 依赖 Level 1（可并行）
```
@ouraihub/hugo (依赖: core, tokens)
@ouraihub/astro (依赖: core, tokens)
```

### Level 3: 依赖 Level 2（可并行）
```
@ouraihub/hugo-base (依赖: hugo, tokens)
@ouraihub/astro-base (依赖: astro, tokens)
```

### Level 4: 依赖 Level 3（可并行）
```
@ouraihub/preset-blog (依赖: hugo-base, tokens)
@ouraihub/preset-docs (依赖: astro-base, tokens)
```

### Level 5: 依赖 Level 4（可并行）
```
@ouraihub/hugo-theme-blog (依赖: preset-blog)
@ouraihub/astro-theme-docs (依赖: preset-docs)
```

### Level 6: 依赖所有包（串行）
```
@ouraihub/cli (依赖: core, hugo, astro, tokens)
```

---

## Turborepo 配置

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "out/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

**说明**：
- `"dependsOn": ["^build"]` - 确保依赖包先构建
- `"outputs"` - 定义缓存的输出目录
- `"cache": false` - dev 和 clean 不缓存

---

## 包版本管理策略

### 内部依赖版本

使用 **workspace 协议**，确保始终使用 workspace 中的最新版本：

```json
{
  "dependencies": {
    "@ouraihub/tokens": "workspace:^",
    "@ouraihub/core": "workspace:^"
  }
}
```

**发布时**，pnpm 会自动将 `workspace:^` 转换为具体版本号。

### 版本同步策略

**选项 A: 独立版本**（推荐）
- 每个包独立版本号
- 使用 Changesets 管理
- 只有变更的包才发布新版本

**选项 B: 统一版本**
- 所有包使用相同版本号
- 任何包变更都发布所有包
- 简单但可能导致不必要的版本号增长

**推荐**：使用选项 A（独立版本）

---

## 循环依赖检测

### 检测工具

```bash
pnpm add -Dw madge

npx madge --circular --extensions ts packages/
```

### 预期结果

```
✔ No circular dependencies found!
```

### CI 集成

```yaml
name: Check Circular Dependencies

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: npx madge --circular --extensions ts packages/
```

---

## 包详细信息

### @ouraihub/tokens

**Layer**: 0 (Design Tokens)  
**依赖**: 无  
**被依赖**: core, hugo, astro, hugo-base, astro-base, preset-blog, preset-docs, cli

**package.json**:
```json
{
  "name": "@ouraihub/tokens",
  "version": "0.1.0",
  "main": "./dist/index.css",
  "exports": {
    ".": "./dist/index.css",
    "./tokens.css": "./dist/tokens.css",
    "./animations.css": "./dist/animations.css",
    "./tailwind-preset": "./tailwind-preset.js"
  },
  "files": ["dist", "tailwind-preset.js"]
}
```

---

### @ouraihub/utils

**Layer**: 1 (Primitives)  
**依赖**: 无  
**被依赖**: core

**package.json**:
```json
{
  "name": "@ouraihub/utils",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/cjs/index.cjs",
  "module": "./dist/esm/index.mjs",
  "types": "./dist/types/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/esm/index.mjs",
      "require": "./dist/cjs/index.cjs"
    }
  },
  "sideEffects": false
}
```

---

### @ouraihub/core

**Layer**: 1 (Primitives)  
**依赖**: tokens, utils  
**被依赖**: hugo, astro, cli

**package.json**:
```json
{
  "name": "@ouraihub/core",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/cjs/index.cjs",
  "module": "./dist/esm/index.mjs",
  "types": "./dist/types/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/esm/index.mjs",
      "require": "./dist/cjs/index.cjs"
    },
    "./theme": {
      "types": "./dist/types/theme/index.d.ts",
      "import": "./dist/esm/theme/index.mjs"
    }
  },
  "dependencies": {
    "@ouraihub/tokens": "workspace:^",
    "@ouraihub/utils": "workspace:^"
  },
  "sideEffects": false
}
```

---

### @ouraihub/hugo

**Layer**: 2 (Components)  
**依赖**: core, tokens  
**被依赖**: hugo-base, cli

**package.json**:
```json
{
  "name": "@ouraihub/hugo",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "exports": {
    ".": "./dist/index.js",
    "./partials/*": "./partials/*"
  },
  "dependencies": {
    "@ouraihub/core": "workspace:^",
    "@ouraihub/tokens": "workspace:^"
  },
  "files": ["dist", "partials"]
}
```

---

### @ouraihub/astro

**Layer**: 2 (Components)  
**依赖**: core, tokens  
**被依赖**: astro-base, cli

**package.json**:
```json
{
  "name": "@ouraihub/astro",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./index.ts",
    "./components/*": "./components/*"
  },
  "dependencies": {
    "@ouraihub/core": "workspace:^",
    "@ouraihub/tokens": "workspace:^"
  },
  "peerDependencies": {
    "astro": "^4.0.0"
  }
}
```

---

## 依赖关系验证

### 验证脚本

```typescript
import { readFileSync } from 'fs';
import { glob } from 'glob';

const packages = glob.sync('packages/*/package.json');

const graph = new Map<string, Set<string>>();

for (const pkgPath of packages) {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  const deps = new Set<string>();
  
  for (const dep of Object.keys(pkg.dependencies || {})) {
    if (dep.startsWith('@ouraihub/')) {
      deps.add(dep);
    }
  }
  
  graph.set(pkg.name, deps);
}

function detectCycles(
  node: string,
  visited: Set<string>,
  stack: Set<string>
): string[] | null {
  visited.add(node);
  stack.add(node);
  
  const deps = graph.get(node) || new Set();
  
  for (const dep of deps) {
    if (!visited.has(dep)) {
      const cycle = detectCycles(dep, visited, stack);
      if (cycle) return cycle;
    } else if (stack.has(dep)) {
      return [dep, node];
    }
  }
  
  stack.delete(node);
  return null;
}

const visited = new Set<string>();
for (const pkg of graph.keys()) {
  if (!visited.has(pkg)) {
    const cycle = detectCycles(pkg, visited, new Set());
    if (cycle) {
      console.error('Circular dependency detected:', cycle.join(' -> '));
      process.exit(1);
    }
  }
}

console.log('✓ No circular dependencies found!');
```

---

## 相关文档

- [实施路线图](../implementation/01-roadmap.md) - 任务依赖关系
- [六层架构](../decisions/005-six-layer-architecture.md) - 架构设计
- [Monorepo 结构](../decisions/004-monorepo-structure.md) - 包结构设计

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-12
