# Critical 问题修复计划

> **版本**: 1.0.0  
> **创建日期**: 2026-05-12  
> **状态**: in-progress  
> **维护者**: Sisyphus (AI Agent)  
> **来源**: 第五轮 Oracle 架构评审

## 概述

本文档基于第五轮 Oracle 架构深度评审结果，详细规划 3 个 Critical 级别问题的修复方案。这些问题**必须在开始实施前解决**，否则会影响架构完整性、代码质量和长期维护。

**修复优先级**: Critical > High > Medium > Low  
**预计总工作量**: 3-5 天  
**目标**: 确保架构设计与实施计划完全对齐

---

## Critical 问题清单

| ID | 问题 | 影响 | 工作量 | 负责人 |
|----|------|------|--------|--------|
| C1 | Layer 4（Presets）定义模糊 | 架构完整性 | 1-2天 | AI Agent |
| C2 | 循环依赖风险未充分防范 | 长期维护 | <1小时 | AI Agent |
| C3 | 测试策略与实施路线图不匹配 | 质量保证 | 2-3天 | AI Agent |

---

## C1: Layer 4（Presets）定义模糊

### 问题描述

**现状**：
- ADR-005 定义 Layer 4 为"配置 + 插件 + 工具的预设组合"
- 实施路线图（01-roadmap.md）中 30 个任务**完全缺失 Preset 层的实施任务**
- 包结构中规划了 `@ouraihub/preset-blog` 和 `@ouraihub/preset-docs`，但没有实施计划

**影响**：
1. **架构不完整**: 声称六层架构，实际只实施五层
2. **用户体验差**: 无法使用 Preset 快速启动项目
3. **边界不清**: Layer 4（Preset）与 Layer 5（Theme）的区别模糊

**根本原因**：
- Preset 概念从 Tailwind CSS 借鉴而来，但未充分适配到组件库场景
- 缺少具体的 API 设计和使用示例
- 未明确 Preset 与 Theme 的关系

### 修复方案

#### 步骤 1: 明确 Preset API 定义

创建文档 `docs/architecture/05-preset-system.md`，定义 Preset 的结构：

```typescript
// Preset 接口定义
export interface Preset {
  // 1. 元数据
  name: string;
  version: string;
  description: string;
  
  // 2. 设计令牌覆盖（可选）
  tokens?: Partial<DesignTokens>;
  
  // 3. 组件配置
  components: {
    themeToggle?: ThemeOptions;
    search?: SearchOptions;
    navigation?: NavigationOptions;
  };
  
  // 4. 布局选择
  layouts: string[];
  
  // 5. 插件列表（未来扩展）
  plugins?: string[];
  
  // 6. 构建配置（可选）
  build?: {
    tailwind?: TailwindConfig;
    postcss?: PostCSSConfig;
  };
}

// 使用示例
export const blogPreset: Preset = {
  name: '@ouraihub/preset-blog',
  version: '0.1.0',
  description: '博客网站预设配置',
  
  tokens: {
    colors: {
      primary: '#2937f0',
      accent: '#f59e0b',
    },
  },
  
  components: {
    themeToggle: {
      storageKey: 'blog-theme',
      defaultTheme: 'system',
    },
    search: {
      placeholder: '搜索文章...',
      hotkey: 'ctrl+k',
    },
  },
  
  layouts: ['post', 'archive', 'about', 'tags'],
  
  plugins: [
    '@ouraihub/plugin-seo',
    '@ouraihub/plugin-analytics',
    '@ouraihub/plugin-rss',
  ],
};
```

#### 步骤 2: 明确 Preset 与 Theme 的关系

**关系定义**：
```
Preset（配置） + Base（基础） = Theme（主题）

@ouraihub/preset-blog        (Layer 4: 配置)
    +
@ouraihub/hugo-base          (Layer 3: 基础)
    =
@ouraihub/hugo-theme-blog    (Layer 5: 主题)
```

**区别**：
- **Preset**: 纯配置，无代码实现，可跨框架复用
- **Theme**: 完整实现，包含代码、样式、布局，框架特定

#### 步骤 3: 添加 Preset 实施任务到路线图

在 `docs/implementation/01-roadmap.md` 中添加新的 Batch：

```markdown
### Batch 4.5: Preset 层实施

**阻塞性**: Dependent  
**并行能力**: 2 个任务并行  
**依赖**: Batch 4 完成

- [ ] **T20: 创建 Preset 接口定义**
  - 复杂度: Simple
  - 依赖数量: 1（T9）
  - 阻塞: T20.1, T20.2
  - 完成标准:
    - [ ] 创建 `packages/core/src/preset/types.ts`
    - [ ] 定义 Preset 接口
    - [ ] 定义 PresetOptions 接口
    - [ ] 导出类型定义

- [ ] **T20.1: 实现 @ouraihub/preset-blog**
  - 复杂度: Medium
  - 依赖数量: 1（T20）
  - 阻塞: 无
  - 并行能力: 可与 T20.2 并行
  - 完成标准:
    - [ ] 创建 `packages/preset-blog/`
    - [ ] 定义博客预设配置
    - [ ] 配置组件选项
    - [ ] 配置布局列表
    - [ ] 编写使用文档

- [ ] **T20.2: 实现 @ouraihub/preset-docs**
  - 复杂度: Medium
  - 依赖数量: 1（T20）
  - 阻塞: 无
  - 并行能力: 可与 T20.1 并行
  - 完成标准:
    - [ ] 创建 `packages/preset-docs/`
    - [ ] 定义文档预设配置
    - [ ] 配置组件选项
    - [ ] 配置布局列表
    - [ ] 编写使用文档
```

#### 步骤 4: 更新包结构文档

在 `docs/architecture/04-package-structure-evaluation.md` 中补充 Preset 包的详细说明。

### 验收标准

- [ ] 创建 `docs/architecture/05-preset-system.md` 文档
- [ ] 定义清晰的 Preset 接口
- [ ] 明确 Preset 与 Theme 的关系
- [ ] 在路线图中添加 3 个 Preset 实施任务（T20, T20.1, T20.2）
- [ ] 更新包结构文档
- [ ] 提供至少 2 个 Preset 使用示例（blog, docs）

### 工作量估算

- 文档编写: 4-6 小时
- API 设计: 2-3 小时
- 路线图更新: 1-2 小时
- **总计**: 1-2 天

---

## C2: 循环依赖风险未充分防范

### 问题描述

**现状**：
- 包依赖关系图显示复杂的依赖网络（11 个包，多层依赖）
- 文档提到使用 madge 检测循环依赖，但**未集成到 CI/CD**
- 没有 pre-commit hook 防止引入循环依赖
- 路线图中无"验证依赖关系"任务

**潜在风险场景**：
```typescript
// 场景 1: 跨层依赖
@ouraihub/core → @ouraihub/hugo → @ouraihub/hugo-base → @ouraihub/core ❌

// 场景 2: CLI 双向依赖
@ouraihub/cli → @ouraihub/core → @ouraihub/cli ❌

// 场景 3: Preset 循环
@ouraihub/preset-blog → @ouraihub/hugo-base → @ouraihub/preset-blog ❌
```

**影响**：
1. **构建失败**: 循环依赖导致 Turborepo 构建失败
2. **运行时错误**: 模块加载顺序问题
3. **维护困难**: 难以追踪依赖关系

### 修复方案

#### 步骤 1: 添加循环依赖检测任务到路线图

在 `docs/implementation/01-roadmap.md` 的 Batch 1 中添加：

```markdown
- [ ] **T14: 配置循环依赖检测**
  - 复杂度: Simple
  - 依赖数量: 1（T2）
  - 阻塞: 所有后续任务
  - 完成标准:
    - [ ] 安装 madge: `pnpm add -Dw madge`
    - [ ] 创建检测脚本 `scripts/check-circular-deps.js`
    - [ ] 添加 npm script: `"check:circular": "node scripts/check-circular-deps.js"`
    - [ ] 集成到 CI/CD（GitHub Actions）
    - [ ] 添加 pre-commit hook
    - [ ] 运行检测，确保无循环依赖
```

#### 步骤 2: 创建检测脚本

创建 `scripts/check-circular-deps.js`：

```javascript
#!/usr/bin/env node
import madge from 'madge';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function checkCircularDeps() {
  console.log('🔍 Checking for circular dependencies...\n');
  
  try {
    const result = await madge(join(rootDir, 'packages'), {
      fileExtensions: ['ts', 'tsx', 'js', 'jsx'],
      excludeRegExp: [
        /node_modules/,
        /dist/,
        /\.test\./,
        /\.spec\./,
      ],
    });
    
    const circular = result.circular();
    
    if (circular.length > 0) {
      console.error('❌ Circular dependencies detected:\n');
      circular.forEach((cycle, index) => {
        console.error(`  ${index + 1}. ${cycle.join(' → ')}`);
      });
      console.error('\n💡 Fix these circular dependencies before proceeding.\n');
      process.exit(1);
    }
    
    console.log('✅ No circular dependencies found!\n');
    
    // 可选：生成依赖关系图
    const image = await result.image('dependency-graph.svg');
    console.log('📊 Dependency graph saved to: dependency-graph.svg\n');
    
  } catch (error) {
    console.error('❌ Error checking circular dependencies:', error.message);
    process.exit(1);
  }
}

checkCircularDeps();
```

#### 步骤 3: 集成到 CI/CD

创建 `.github/workflows/check-circular-deps.yml`：

```yaml
name: Check Circular Dependencies

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  check-circular:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Check circular dependencies
        run: pnpm check:circular
      
      - name: Upload dependency graph
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: dependency-graph
          path: dependency-graph.svg
```

#### 步骤 4: 添加 pre-commit hook

创建 `.husky/pre-commit`：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Checking for circular dependencies..."
pnpm check:circular

if [ $? -ne 0 ]; then
  echo "❌ Commit blocked: Fix circular dependencies first"
  exit 1
fi

echo "✅ No circular dependencies detected"
```

安装 husky：

```bash
pnpm add -Dw husky
npx husky install
```

#### 步骤 5: 更新根 package.json

```json
{
  "scripts": {
    "check:circular": "node scripts/check-circular-deps.js",
    "prepare": "husky install"
  },
  "devDependencies": {
    "madge": "^6.1.0",
    "husky": "^8.0.3"
  }
}
```

### 验收标准

- [ ] 创建 `scripts/check-circular-deps.js` 脚本
- [ ] 创建 `.github/workflows/check-circular-deps.yml` CI 配置
- [ ] 创建 `.husky/pre-commit` hook
- [ ] 更新根 `package.json` 添加 scripts
- [ ] 在路线图中添加 T14 任务
- [ ] 运行检测，确保当前无循环依赖
- [ ] 测试 pre-commit hook 是否生效

### 工作量估算

- 脚本编写: 30 分钟
- CI/CD 配置: 15 分钟
- Pre-commit hook: 15 分钟
- 测试验证: 15 分钟
- **总计**: < 1 小时

---

## C3: 测试策略与实施路线图不匹配

### 问题描述

**现状**：
- `docs/testing/01-integration-strategy.md` 声称"测试金字塔：单元 70%、集成 20%、E2E 10%"
- 实施路线图只有 2 个单元测试任务（T8: ThemeManager 测试，T11: DOM 工具测试）
- **完全缺失集成测试和 E2E 测试任务**
- 缺少"测试覆盖率门禁"任务

**影响**：
1. **质量风险**: 无法验证组件在真实场景下的交互
2. **集成问题**: 可能在集成到 hugo-theme-paper 后发现大量问题
3. **覆盖率不足**: 无法保证 80%+ 覆盖率目标
4. **用户体验**: 无法验证完整的用户流程

**测试覆盖缺口**：
```
当前路线图：
✅ 单元测试: T8 (ThemeManager), T11 (DOM 工具)
❌ 集成测试: 无
❌ E2E 测试: 无
❌ 覆盖率门禁: 无
```

### 修复方案

#### 步骤 1: 添加集成测试和 E2E 测试任务

在 `docs/implementation/01-roadmap.md` 中添加新的 Batch 5.5：

```markdown
### Batch 5.5: 集成测试和 E2E 测试

**阻塞性**: Dependent  
**并行能力**: 3 个任务并行  
**依赖**: Batch 5 完成

- [ ] **T22: 集成测试 - ThemeManager + DOM 工具**
  - 复杂度: Medium
  - 依赖数量: 1（T23）
  - 阻塞: T22.3
  - 并行能力: 可与 T22.1, T22.2 并行
  - 完成标准:
    - [ ] 创建 `packages/core/__tests__/integration/theme-dom.test.ts`
    - [ ] 测试 ThemeManager 与 DOM 工具的集成
    - [ ] 测试事件系统与 DOM 操作的交互
    - [ ] 测试多个实例的协同工作
    - [ ] 测试内存泄漏（事件监听器清理）
    - [ ] 覆盖率 > 85%

- [ ] **T22.1: 集成测试 - Hugo 包装层自动初始化**
  - 复杂度: Medium
  - 依赖数量: 1（T23）
  - 阻塞: T22.3
  - 并行能力: 可与 T22, T22.2 并行
  - 完成标准:
    - [ ] 创建 `packages/hugo/__tests__/integration/auto-init.test.ts`
    - [ ] 测试 data 属性自动扫描
    - [ ] 测试多个组件同时初始化
    - [ ] 测试初始化顺序
    - [ ] 测试错误处理（无效配置）
    - [ ] 使用 jsdom 模拟 Hugo 生成的 HTML

- [ ] **T22.2: E2E 测试 - 完整主题切换流程**
  - 复杂度: Medium
  - 依赖数量: 1（T23）
  - 阻塞: T22.3
  - 并行能力: 可与 T22, T22.1 并行
  - 完成标准:
    - [ ] 使用 Playwright 创建 E2E 测试
    - [ ] 测试用户点击主题切换按钮
    - [ ] 测试主题持久化（刷新页面）
    - [ ] 测试系统主题跟随
    - [ ] 测试跨页面主题一致性
    - [ ] 测试防闪烁机制
    - [ ] 在真实 Hugo 项目中运行

- [ ] **T22.3: 配置测试覆盖率门禁**
  - 复杂度: Simple
  - 依赖数量: 3（T22, T22.1, T22.2）
  - 阻塞: 无
  - 完成标准:
    - [ ] 配置 Vitest 覆盖率报告
    - [ ] 设置覆盖率阈值（80%+）
    - [ ] 集成到 CI/CD
    - [ ] 添加覆盖率徽章到 README
    - [ ] 配置覆盖率报告上传（Codecov）
```

#### 步骤 2: 配置 Playwright E2E 测试

创建 `packages/hugo/playwright.config.ts`：

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:1313',
    trace: 'on-first-retry',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  
  webServer: {
    command: 'hugo server',
    url: 'http://localhost:1313',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### 步骤 3: 配置覆盖率门禁

更新 `packages/core/vitest.config.ts`：

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        'test/',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

#### 步骤 4: 集成覆盖率到 CI/CD

更新 `.github/workflows/test.yml`：

```yaml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run unit tests
        run: pnpm test
      
      - name: Run integration tests
        run: pnpm test:integration
      
      - name: Generate coverage report
        run: pnpm test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
      
      - name: Check coverage thresholds
        run: pnpm test:coverage --reporter=json-summary
      
      - name: Comment coverage on PR
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: ./coverage/lcov.info
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

#### 步骤 5: 更新测试策略文档

在 `docs/testing/01-integration-strategy.md` 中补充：

```markdown
## 测试任务清单

### 单元测试
- [x] T8: ThemeManager 单元测试
- [x] T11: DOM 工具单元测试

### 集成测试
- [ ] T22: ThemeManager + DOM 工具集成测试
- [ ] T22.1: Hugo 包装层自动初始化测试

### E2E 测试
- [ ] T22.2: 完整主题切换流程 E2E 测试

### 覆盖率
- [ ] T22.3: 配置覆盖率门禁（80%+）
```

### 验收标准

- [ ] 在路线图中添加 Batch 5.5（4 个测试任务）
- [ ] 创建 Playwright 配置文件
- [ ] 配置 Vitest 覆盖率阈值
- [ ] 集成覆盖率到 CI/CD
- [ ] 更新测试策略文档
- [ ] 添加覆盖率徽章到 README

### 工作量估算

- 路线图更新: 2-3 小时
- Playwright 配置: 2-3 小时
- 覆盖率配置: 1-2 小时
- CI/CD 集成: 2-3 小时
- 文档更新: 1-2 小时
- **总计**: 2-3 天

---

## 修复顺序建议

### 阶段 1: 快速修复（< 1 小时）
1. **C2: 循环依赖检测** - 最快，影响最大
   - 创建检测脚本
   - 集成到 CI/CD
   - 添加 pre-commit hook

### 阶段 2: 文档补充（1-2 天）
2. **C1: Preset 层设计** - 需要设计和文档
   - 创建 Preset 系统文档
   - 定义 API 接口
   - 更新路线图

### 阶段 3: 测试完善（2-3 天）
3. **C3: 测试策略对齐** - 工作量最大
   - 添加集成测试任务
   - 配置 E2E 测试
   - 配置覆盖率门禁

**总时间线**: 3-5 天

---

## 验证检查清单

修复完成后，执行以下检查：

### C1 验证
- [ ] `docs/architecture/05-preset-system.md` 文档存在
- [ ] Preset 接口定义清晰
- [ ] 路线图包含 T20, T20.1, T20.2 任务
- [ ] 至少有 2 个 Preset 使用示例

### C2 验证
- [ ] `scripts/check-circular-deps.js` 脚本存在
- [ ] `.github/workflows/check-circular-deps.yml` 配置存在
- [ ] `.husky/pre-commit` hook 存在
- [ ] 运行 `pnpm check:circular` 成功
- [ ] 尝试创建循环依赖，pre-commit hook 阻止提交

### C3 验证
- [ ] 路线图包含 Batch 5.5（4 个测试任务）
- [ ] `playwright.config.ts` 配置存在
- [ ] Vitest 覆盖率阈值配置为 80%+
- [ ] CI/CD 包含覆盖率检查
- [ ] 测试策略文档已更新

---

## 风险和缓解措施

### 风险 1: Preset API 设计不够灵活

**缓解措施**:
- 参考 Tailwind、Chakra UI 的 Preset 设计
- 提供扩展点（plugins 字段）
- 支持 Preset 组合（extends 字段）

### 风险 2: 循环依赖检测误报

**缓解措施**:
- 配置 excludeRegExp 排除测试文件
- 提供 --ignore 参数跳过特定文件
- 在 CI 中生成依赖关系图，便于排查

### 风险 3: E2E 测试不稳定

**缓解措施**:
- 使用 Playwright 的重试机制
- 添加明确的等待条件（waitForSelector）
- 在 CI 中录制失败的测试视频

---

## 相关文档

- [第五轮 Oracle 评审报告](../ARCHITECTURE_REVIEW_ROUND5.md) - 完整评审结果
- [实施路线图](./01-roadmap.md) - 原始路线图
- [测试策略](../testing/01-integration-strategy.md) - 测试金字塔
- [包依赖关系](../architecture/03-package-dependencies.md) - 依赖关系图

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-12
