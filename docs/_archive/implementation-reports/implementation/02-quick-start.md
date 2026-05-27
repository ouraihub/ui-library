# 快速开始指南

> **版本**: 1.4.0  
> **最后更新**: 2026-05-12  
> **状态**: approved  
> **维护者**: Sisyphus (AI Agent)

## 立即可行的第一步（今天就能做）

这个指南将帮助你在 **30 分钟内**创建组件库的基础架构，并提取第一个可复用组件。

---

## 步骤 0: 环境准备（5分钟）

### 检查环境

在开始之前，确保你的开发环境满足以下要求：

```bash
# 检查 Node.js 版本（需要 >= 18）
node --version

# 检查 pnpm 版本（需要 >= 8）
pnpm --version
```

### 安装必要工具

如果缺少工具，请先安装：

```bash
# 安装 Node.js（如果未安装）
# 访问 https://nodejs.org/ 下载 LTS 版本

# 安装 pnpm（如果未安装）
npm install -g pnpm

# 验证安装
pnpm --version
```

### 准备工作目录

```bash
# 进入你的工作空间目录
cd <your-workspace>

# 例如: cd C:\projects 或 cd ~/projects
```

---

## 步骤 1: 创建 Monorepo（5分钟）

```bash
# 1. 创建项目目录
mkdir ui-library
cd ui-library

# 2. 初始化项目
pnpm init

# 3. 配置 workspace
echo "packages:" > pnpm-workspace.yaml
echo "  - 'packages/*'" >> pnpm-workspace.yaml

# 4. 安装开发依赖
pnpm add -Dw turbo typescript esbuild vitest @types/node

# 5. 创建包目录
mkdir -p packages/core/src/theme
mkdir -p packages/core/src/utils
mkdir -p packages/core/src/types
```

---

## 步骤 2: 配置 Turborepo（5分钟）

创建 `turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

更新根 `package.json`:

```json
{
  "name": "ui-library",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.9.0",
    "esbuild": "^0.28.0",
    "vitest": "^2.0.0",
    "@types/node": "^20.0.0"
  }
}
```

---

## 步骤 3: 提取主题切换系统（15分钟）

### 3.1 创建 ThemeManager

创建 `packages/core/src/theme/ThemeManager.ts`:

```typescript
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeOptions {
  storageKey?: string;
  attribute?: string;
  defaultTheme?: ThemeMode;
}

export class ThemeManager {
  private storageKey: string;
  private attribute: string;
  private root: HTMLElement;
  private mediaQuery: MediaQueryList;

  constructor(options: ThemeOptions = {}) {
    this.storageKey = options.storageKey || 'theme';
    this.attribute = options.attribute || 'data-theme';
    this.root = document.documentElement;
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    this.init(options.defaultTheme);
  }

  private init(defaultTheme?: ThemeMode): void {
    const saved = this.getSaved();
    const theme = saved || defaultTheme || 'system';
    this.apply(theme);
    this.watchSystem();
  }

  setTheme(mode: ThemeMode): void {
    localStorage.setItem(this.storageKey, mode);
    this.apply(mode);
  }

  getTheme(): ThemeMode {
    return (this.getSaved() || 'system') as ThemeMode;
  }

  toggle(): void {
    const current = this.getTheme();
    const next = current === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  private apply(mode: ThemeMode): void {
    const resolved = mode === 'system' ? this.getSystemTheme() : mode;
    this.root.setAttribute(this.attribute, resolved);
  }

  private getSystemTheme(): 'light' | 'dark' {
    return this.mediaQuery.matches ? 'dark' : 'light';
  }

  private watchSystem(): void {
    this.mediaQuery.addEventListener('change', () => {
      if (this.getSaved() === 'system') {
        this.apply('system');
      }
    });
  }

  private getSaved(): ThemeMode | null {
    return localStorage.getItem(this.storageKey) as ThemeMode | null;
  }
}
```

### 3.2 创建入口文件

创建 `packages/core/src/theme/index.ts`:

```typescript
export { ThemeManager } from './ThemeManager';
export type { ThemeMode, ThemeOptions } from './ThemeManager';
```

创建 `packages/core/src/index.ts`:

```typescript
export * from './theme';
```

### 3.3 配置构建

创建 `packages/core/build.js`:

> **注意**: 此文件使用 top-level await，需要在 package.json 中设置 `"type": "module"`（见下方配置）。

```javascript
import esbuild from 'esbuild';

// ESM 构建
await esbuild.build({
  entryPoints: ['src/index.ts'],
  outdir: 'dist/esm',
  format: 'esm',
  platform: 'neutral',
  target: 'es2020',
  bundle: true,
  splitting: true,
  outExtension: { '.js': '.mjs' },
});

// CJS 构建
await esbuild.build({
  entryPoints: ['src/index.ts'],
  outdir: 'dist/cjs',
  format: 'cjs',
  platform: 'neutral',
  target: 'es2020',
  bundle: true,
  outExtension: { '.js': '.cjs' },
});

console.log('✅ Build complete');
```

创建 `packages/core/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist/types",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

创建 `packages/core/package.json`:

> **关键配置说明**:
> - `"type": "module"` - 启用 ES 模块，支持 build.js 中的 top-level await
> - `exports` 字段 - 定义包的导出路径，支持子路径导入（如 `@ouraihub/core/theme`）

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
  "files": ["dist"],
  "scripts": {
    "build": "node build.js && tsc --emitDeclarationOnly",
    "dev": "node build.js --watch",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "esbuild": "^0.28.0",
    "typescript": "^5.9.0"
  }
}
```

---

## 步骤 4: 构建并测试（5分钟）

```bash
# 构建
cd packages/core
pnpm install
pnpm build

# 验证输出
ls dist/
# 应该看到: cjs/ esm/ types/
```

---

## 步骤 5: 在项目中使用（5分钟）

### 在 hugo-theme-paper 中测试

```bash
cd <your-workspace>/hugo-theme-paper

# 安装组件库
pnpm add @ouraihub/core@workspace:*
```

修改 `assets/ts/main.ts`:

```typescript
// 删除或注释掉原有的主题切换代码
// import './toggle-theme';

// 改为使用组件库
import { ThemeManager } from '@ouraihub/core/theme';

// 初始化主题管理器
const theme = new ThemeManager({
  storageKey: 'theme',
  attribute: 'data-theme',
  defaultTheme: 'system'
});

// 绑定切换按钮
document.querySelector('#theme-toggle')?.addEventListener('click', () => {
  theme.toggle();
});
```

重新构建并测试:

```bash
pnpm run build
pnpm run dev
```

打开浏览器测试主题切换功能！

---

## 验证清单

- [ ] Monorepo 创建成功
- [ ] Turborepo 配置正确
- [ ] core 包构建成功
- [ ] 在 hugo-theme-paper 中成功导入
- [ ] 主题切换功能正常工作

---

## 下一步

### 立即可做

1. **提取 DOM 工具函数**（参考实施路线图 Day 4）
2. **创建 styles 包**（参考实施路线图 Week 2）
3. **逐步迁移其他项目**

### 长期规划

查看 [实施路线图](./01-roadmap.md) 了解完整的 4 周计划。

---

## 常见问题

### Q: 如何更改组织名？

本指南使用 `@ouraihub` 作为示例组织名。如需自定义：

1. 将所有 `@ouraihub` 替换为你的组织名（如 `@myname` 或 `@mycompany`）
2. 更新 `packages/core/package.json` 中的 `name` 字段
3. 更新导入语句中的包名

### Q: 如何发布到 npm？

```bash
# 在 packages/core 目录
npm login
npm publish --access public
```

### Q: 如何添加更多工具函数？

在 `packages/core/src/utils/` 下创建新文件，然后在 `src/utils/index.ts` 中导出。

### Q: 构建失败怎么办？

检查：
1. Node.js 版本 >= 18
2. pnpm 已安装
3. 所有依赖已安装（`pnpm install`）

---

## 获取帮助

- 查看 [架构设计文档](../architecture/02-component-library-design.md)
- 查看 [Pagefind 研究](../architecture/01-pagefind-study.md)
- 参考现有项目的实现

---

**恭喜！你已经创建了第一个可复用组件。** 🎉

现在你可以：
- 继续提取其他重复代码
- 在更多项目中使用组件库
- 逐步完善功能

**记住**: 渐进式迁移，不要一次性改动太多。
