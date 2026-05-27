# High 优先级问题修复计划

> **版本**: 1.0.0  
> **创建日期**: 2026-05-12  
> **状态**: in-progress  
> **维护者**: Sisyphus (AI Agent)  
> **来源**: 第五轮 Oracle 架构评审

## 概述

本文档基于第五轮 Oracle 架构深度评审结果，详细规划 7 个 High 优先级问题的修复方案。这些问题**强烈建议在 Phase 1 解决**，以提升架构质量、开发者体验和实施可行性。

**修复优先级**: High（在 Critical 之后，Medium 之前）  
**预计总工作量**: 5-7 天  
**目标**: 提升架构完整性和开发者体验

---

## High 优先级问题清单

| ID | 问题 | 影响 | 工作量 | 负责人 |
|----|------|------|--------|--------|
| H1 | CLI 包职责过重 | 包结构 | 半天 | AI Agent |
| H2 | 缺少 React 扩展设计 | 未来扩展 | 文档 | AI Agent |
| H3 | 关键路径过长 | 风险控制 | 调整 | AI Agent |
| H4 | 缺少回滚计划 | 风险控制 | 流程 | AI Agent |
| H5 | 防闪烁机制未明确 | 核心功能 | 1-2小时 | AI Agent |
| H6 | 缺少快速开始示例 | 开发者体验 | 半天 | AI Agent |
| H7 | 错误消息未国际化 | 开发者体验 | 1天 | AI Agent |

---

## H1: CLI 包职责过重

### 问题描述

**现状**：
- `@ouraihub/cli` 依赖 4 个包（core、hugo、astro、tokens）
- CLI 的职责不清晰：是脚手架工具还是开发工具？
- 如果是脚手架，不应该有运行时依赖
- 如果是开发工具，应该是 devDependencies

**当前设计**：
```json
{
  "name": "@ouraihub/cli",
  "dependencies": {
    "@ouraihub/core": "workspace:^",
    "@ouraihub/hugo": "workspace:^",
    "@ouraihub/astro": "workspace:^",
    "@ouraihub/tokens": "workspace:^"
  }
}
```

**影响**：
1. **依赖混乱**: CLI 依赖所有包，可能导致循环依赖
2. **用户困惑**: 不清楚 CLI 的使用场景
3. **包体积**: 如果是脚手架，不应该打包所有依赖

### 修复方案

#### 步骤 1: 明确 CLI 的两种模式

**模式 1: 脚手架工具（推荐）**

类似 `create-react-app`、`create-next-app`：

```bash
# 创建新项目
npx create-ouraihub-app my-blog --preset blog --framework hugo

# 生成项目后，CLI 不再需要
cd my-blog
pnpm install  # 只安装项目依赖，不包含 CLI
```

**特点**：
- ✅ 生成项目代码
- ✅ 不需要运行时依赖
- ✅ 用户不需要安装 CLI 包
- ✅ 避免循环依赖

**模式 2: 开发工具**

类似 `tailwindcss` CLI：

```bash
# 安装 CLI
pnpm add -D @ouraihub/cli

# 使用 CLI 命令
npx @ouraihub/cli build
npx @ouraihub/cli add component theme-toggle
```

**特点**：
- ✅ 提供开发命令
- ❌ 需要安装 CLI 包
- ❌ 可能有循环依赖风险

#### 步骤 2: 推荐采用模式 1（脚手架）

**理由**：
1. 符合现代前端工具链趋势（Vite、Next.js 都用脚手架）
2. 避免循环依赖问题
3. 用户体验更好（npx 一键创建）
4. 减少维护成本

**实施方案**：

```typescript
// packages/cli/src/create.ts
import { scaffold } from './scaffold';
import { installDependencies } from './install';

export async function create(options: CreateOptions) {
  const { projectName, preset, framework } = options;
  
  // 1. 创建项目目录
  await scaffold({
    projectName,
    template: `${framework}-${preset}`, // hugo-blog, astro-docs
  });
  
  // 2. 生成配置文件
  await generateConfig({
    preset: `@ouraihub/preset-${preset}`,
    framework,
  });
  
  // 3. 安装依赖
  await installDependencies(projectName);
  
  // 4. 初始化 git
  await initGit(projectName);
  
  console.log(`✅ Project created: ${projectName}`);
  console.log(`📦 Next steps:`);
  console.log(`   cd ${projectName}`);
  console.log(`   pnpm dev`);
}
```

**package.json**：
```json
{
  "name": "create-ouraihub-app",
  "version": "0.1.0",
  "bin": {
    "create-ouraihub-app": "./dist/index.js"
  },
  "dependencies": {
    "prompts": "^2.4.2",
    "chalk": "^5.3.0",
    "ora": "^7.0.1"
  },
  "devDependencies": {
    "@ouraihub/core": "workspace:^",
    "@ouraihub/hugo": "workspace:^",
    "@ouraihub/astro": "workspace:^"
  }
}
```

**注意**: 依赖移到 `devDependencies`，只在构建模板时使用。

#### 步骤 3: 更新文档

在 `docs/architecture/06-framework-extension.md` 中补充 CLI 使用说明。

### 验收标准

- [ ] 明确 CLI 定位为"脚手架工具"
- [ ] 更新 `packages/cli/package.json`（依赖移到 devDependencies）
- [ ] 实现 `create` 命令
- [ ] 提供至少 2 个模板（hugo-blog、astro-docs）
- [ ] 更新文档说明 CLI 使用方式
- [ ] 测试 `npx create-ouraihub-app` 可用

### 工作量估算

- 设计决策: 1 小时
- 代码实现: 2-3 小时
- 文档更新: 1 小时
- **总计**: 半天

---

## H2: 缺少 React 扩展的前瞻性设计

### 问题描述

**现状**：
- 架构声称支持未来扩展 React、Vue、Svelte
- 但包结构和依赖关系图中**未预留这些框架的位置**
- 缺少扩展指南

**影响**：
1. **扩展困难**: 添加新框架时可能需要重构
2. **架构不完整**: 声称支持但没有设计
3. **用户困惑**: 不知道如何扩展

### 修复方案

#### 步骤 1: 已完成 ✅

在 `docs/architecture/06-framework-extension.md` 中已经完成：
- ✅ React 扩展设计（包结构、组件设计、Hooks）
- ✅ Vue 扩展设计（包结构、组件设计、Composables）
- ✅ Svelte 扩展设计（包结构、组件设计）
- ✅ 扩展决策矩阵
- ✅ 实施优先级
- ✅ 扩展检查清单

#### 步骤 2: 更新主文档引用

在 `docs/DESIGN.md` 中添加扩展路径的引用：

```markdown
## 未来扩展

本架构设计支持未来添加更多框架。详见 [框架扩展路径](./architecture/06-framework-extension.md)。

**计划支持的框架**：
- React（Phase 2，高优先级）
- Vue（Phase 3，中优先级）
- Svelte（Phase 4，低优先级）
```

### 验收标准

- [x] 创建框架扩展路径文档（已完成）
- [ ] 在主文档中添加扩展路径引用
- [ ] 在 ADR-005 中补充扩展说明

### 工作量估算

- 文档更新: 30 分钟
- **总计**: 文档更新（已完成大部分）

---

## H3: 关键路径过长（9个任务）

### 问题描述

**现状**：
- 主题系统路径：T1 → T2 → T6,T7 → T8 → T9 → T21 → T23 → T25 → T30
- **关键路径长度**: 9 个任务
- 即使完美并行，仍需至少 9 个"时间单位"
- 无法快速验证核心假设

**影响**：
1. **风险高**: 任何一个任务延误都会影响整体进度
2. **反馈慢**: 无法快速验证核心设计是否可行
3. **调整难**: 发现问题时已经投入大量工作

### 修复方案

#### 步骤 1: 引入"快速原型"验证路径

在 Batch 1 之前添加 **Batch 0.5: 快速原型验证**：

```markdown
### Batch 0.5: 快速原型验证（2-3小时）

**目标**: 快速验证核心假设，降低风险

- [ ] **T0.1: 创建最小 ThemeManager**
  - 复杂度: Simple
  - 依赖数量: 0
  - 完成标准:
    - [ ] 创建单文件 `prototype/ThemeManager.js`
    - [ ] 实现基本的 setTheme()、getTheme()
    - [ ] 无持久化、无事件系统
    - [ ] 代码 < 50 行

- [ ] **T0.2: 创建最小 Hugo 包装**
  - 复杂度: Simple
  - 依赖数量: 1（T0.1）
  - 完成标准:
    - [ ] 创建 `prototype/theme-toggle.html`
    - [ ] 硬编码初始化（无自动扫描）
    - [ ] 代码 < 30 行

- [ ] **T0.3: 在 hugo-theme-paper 中验证**
  - 复杂度: Simple
  - 依赖数量: 1（T0.2）
  - 完成标准:
    - [ ] 复制原型代码到 hugo-theme-paper
    - [ ] 测试主题切换是否工作
    - [ ] 记录遇到的问题
    - [ ] 决策：继续 / 调整设计
```

**收益**：
- ✅ 2-3 小时内验证核心假设
- ✅ 发现设计问题的成本极低
- ✅ 提升团队信心
- ✅ 不影响正式实施

#### 步骤 2: 更新路线图

在 `docs/implementation/01-roadmap.md` 中添加 Batch 0.5。

### 验收标准

- [ ] 在路线图中添加 Batch 0.5（3个任务）
- [ ] 创建 `prototype/` 目录
- [ ] 实施快速原型验证
- [ ] 记录验证结果

### 工作量估算

- 路线图调整: 30 分钟
- 原型实施: 2-3 小时
- **总计**: 快速调整

---

## H4: 缺少回滚计划

### 问题描述

**现状**：
- 路线图假设所有任务都会成功
- **没有失败处理机制**
- 没有回滚或重试策略

**风险场景**：
- T23 集成到 hugo-theme-paper 后发现性能问题
- T25 测试发现主题切换在某些浏览器失效
- T9 构建产物在某些环境无法使用

**影响**：
1. **无法回滚**: 发现问题后不知道如何恢复
2. **浪费时间**: 可能在错误的方向上投入大量时间
3. **质量风险**: 可能发布有问题的版本

### 修复方案

#### 步骤 1: 在每个 Batch 后添加验证门禁

```markdown
## 验证门禁机制

### Batch 完成后的验证流程

每个 Batch 完成后，执行以下验证：

1. **技术验证**
   - 所有测试通过
   - 代码覆盖率达标
   - 构建成功
   - 无 TypeScript 错误

2. **功能验证**
   - 核心功能可用
   - 性能达标
   - 无明显 bug

3. **决策点**
   - ✅ **继续**: 所有验证通过，进入下一个 Batch
   - ⚠️ **优化**: 发现小问题，修复后继续
   - ❌ **回滚**: 发现重大问题，回滚到上一个 Batch

### 回滚策略

**Batch 2 完成后**：
- 验证: 核心类 API 是否符合设计？
- 回滚: `git reset --hard batch-1-complete`
- 重新设计: 调整 API 设计，重新实施

**Batch 5 完成后**：
- 验证: 集成是否成功？性能是否达标？
- 回滚: 恢复 hugo-theme-paper 的旧实现
- 优化: 修复性能问题，重新集成
```

#### 步骤 2: 使用 Git 标签标记 Batch 完成点

```bash
# Batch 1 完成后
git tag -a batch-1-complete -m "Batch 1: 基础设施完成"
git push origin batch-1-complete

# Batch 2 完成后
git tag -a batch-2-complete -m "Batch 2: 核心实现完成"
git push origin batch-2-complete

# 如果需要回滚
git reset --hard batch-1-complete
```

#### 步骤 3: 创建验证检查清单

在每个 Batch 的文档中添加验证检查清单。

### 验收标准

- [ ] 在路线图中添加"验证门禁机制"章节
- [ ] 定义每个 Batch 的验证标准
- [ ] 定义回滚策略
- [ ] 使用 Git 标签标记完成点

### 工作量估算

- 流程设计: 1 小时
- 文档更新: 1 小时
- **总计**: 流程设计

---

## H5: 防闪烁机制未明确

### 问题描述

**现状**：
- T7 创建的防闪烁脚本（toggle-theme.ts）需要**内联到 `<head>`**
- 路线图未说明如何处理
- Hugo 如何内联 TypeScript 编译后的代码？

**技术挑战**：
```html
<!-- 需要在 HTML 渲染前执行 -->
<head>
  <script>
    // 内联的防闪烁代码
    (function() {
      const theme = localStorage.getItem('theme');
      if (theme) {
        document.documentElement.setAttribute('data-theme', theme);
      }
    })();
  </script>
</head>
```

**问题**：
- 如何保证代码最小化？
- 如何在多个项目间复用？
- 如何处理 TypeScript 编译？

### 修复方案

#### 步骤 1: 设计内联脚本机制

**方案 A: 导出字符串（推荐）**

```typescript
// packages/core/src/theme/anti-flicker.ts
export const antiFlickerScript = `
(function(){
  try{
    var t=localStorage.getItem('theme')||'system';
    if(t==='system'){
      t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
    }
    document.documentElement.setAttribute('data-theme',t);
  }catch(e){}
})();
`.trim();
```

**Hugo 使用**：
```html
<!-- layouts/partials/head.html -->
{{ $script := resources.Get "js/anti-flicker.js" | minify }}
<script>{{ $script.Content | safeJS }}</script>
```

**Astro 使用**：
```astro
---
import { antiFlickerScript } from '@ouraihub/core/theme';
---
<script is:inline set:html={antiFlickerScript} />
```

**方案 B: 构建时生成**

```javascript
// packages/core/build.js
import { minify } from 'terser';

const antiFlickerCode = `
(function() {
  const theme = localStorage.getItem('theme') || 'system';
  // ...
})();
`;

const minified = await minify(antiFlickerCode);
fs.writeFileSync('dist/anti-flicker.min.js', minified.code);
```

#### 步骤 2: 更新 T7 任务

在路线图中更新 T7 的完成标准：

```markdown
- [ ] **T7: 创建防闪烁脚本**
  - 完成标准:
    - [ ] 创建 `packages/core/src/theme/anti-flicker.ts`
    - [ ] 导出 `antiFlickerScript` 字符串
    - [ ] 代码已最小化（< 200 字节）
    - [ ] 无依赖（纯 JS）
    - [ ] 提供 Hugo 和 Astro 使用示例
    - [ ] 测试在真实项目中可用
```

### 验收标准

- [ ] 设计内联脚本机制（方案 A 或 B）
- [ ] 更新 T7 任务的完成标准
- [ ] 创建使用示例（Hugo + Astro）
- [ ] 测试内联脚本可用

### 工作量估算

- 设计方案: 30 分钟
- 实现代码: 1 小时
- 文档更新: 30 分钟
- **总计**: 1-2 小时

---

## H6: 缺少快速开始示例

### 问题描述

**现状**：
- `docs/implementation/02-quick-start.md` 文档存在
- 但**未在路线图中实施**
- 缺少实际的代码示例

**影响**：
1. **用户无法快速上手**: 不知道如何使用
2. **API 易用性未验证**: 可能设计了难用的 API
3. **学习曲线陡峭**: 缺少入门指南

### 修复方案

#### 步骤 1: 在 T29 中添加实际代码示例

更新 T29 任务：

```markdown
- [ ] **T29: 使用示例**
  - 完成标准:
    - [ ] 创建 `examples/` 目录
    - [ ] 示例 1: 最简单的使用（Hugo）
    - [ ] 示例 2: 自定义配置（Astro）
    - [ ] 示例 3: 编程式使用
    - [ ] 示例 4: 多实例使用
    - [ ] 每个示例都可运行
    - [ ] 代码注释完整
```

#### 步骤 2: 创建示例代码

**示例 1: 最简单的使用（Hugo）**

```html
<!-- layouts/partials/theme-toggle.html -->
{{ partial "theme-toggle.html" . }}

<!-- layouts/baseof.html -->
<script type="module" src="/js/ui-init.js"></script>
```

**示例 2: 自定义配置（Astro）**

```astro
---
import { ThemeToggle } from '@ouraihub/astro';
---

<ThemeToggle 
  storageKey="my-theme"
  defaultTheme="dark"
  class="btn btn-ghost"
/>
```

**示例 3: 编程式使用**

```typescript
import { ThemeManager } from '@ouraihub/core/theme';

// 创建实例
const theme = new ThemeManager();

// 设置主题
theme.setTheme('dark');

// 监听变化
theme.onThemeChange((newTheme) => {
  console.log('主题已切换:', newTheme);
});

// 切换主题
theme.toggle();
```

**示例 4: 多实例使用**

```typescript
// 主题管理器
const mainTheme = new ThemeManager(document.body, {
  storageKey: 'main-theme',
});

// 编辑器主题（独立）
const editorTheme = new ThemeManager(document.querySelector('.editor'), {
  storageKey: 'editor-theme',
  attribute: 'data-editor-theme',
});
```

#### 步骤 3: 更新快速开始文档

在 `docs/implementation/02-quick-start.md` 中补充实际代码。

### 验收标准

- [ ] 创建 `examples/` 目录
- [ ] 提供至少 4 个可运行的示例
- [ ] 每个示例都有完整注释
- [ ] 更新快速开始文档
- [ ] 在 README 中链接到示例

### 工作量估算

- 创建示例: 2-3 小时
- 文档更新: 1 小时
- **总计**: 半天

---

## H7: 错误消息未国际化

### 问题描述

**现状**：
- 错误处理文档中所有错误消息都是**中文**
- 代码示例中是**英文**
- 不一致

**示例**：
```typescript
// 文档中的示例（中文）
ERROR_MESSAGES = {
  'VALIDATION_ERROR': '输入的信息格式不正确，请检查后重试',
}

// 代码示例中（英文）
throw new Error('[UI-Library] Invalid theme mode');
```

**影响**：
1. **国际化困难**: 核心库使用中文，难以国际化
2. **用户困惑**: 英文项目中出现中文错误
3. **不专业**: 开源项目应该使用英文

### 修复方案

#### 步骤 1: 核心库使用英文错误消息

```typescript
// packages/core/src/errors/messages.ts
export const ERROR_MESSAGES = {
  INVALID_THEME_MODE: 'Invalid theme mode. Expected "light", "dark", or "system".',
  STORAGE_UNAVAILABLE: 'localStorage is not available in this environment.',
  INVALID_ELEMENT: 'Invalid element provided. Expected HTMLElement.',
} as const;
```

#### 步骤 2: 提供可选的 i18n 包（未来）

```typescript
// packages/i18n/src/zh-CN.ts
export const zhCN = {
  INVALID_THEME_MODE: '无效的主题模式。期望 "light"、"dark" 或 "system"。',
  STORAGE_UNAVAILABLE: '当前环境不支持 localStorage。',
  INVALID_ELEMENT: '无效的元素。期望 HTMLElement。',
};

// 使用
import { ThemeManager } from '@ouraihub/core/theme';
import { zhCN } from '@ouraihub/i18n/zh-CN';

const theme = new ThemeManager(undefined, {
  messages: zhCN,
});
```

#### 步骤 3: 更新错误处理文档

在 `docs/guides/error-handling.md` 中：
- 所有错误消息改为英文
- 添加 i18n 章节（未来扩展）

### 验收标准

- [ ] 核心库所有错误消息使用英文
- [ ] 更新错误处理文档
- [ ] 提供 i18n 扩展机制（接口定义）
- [ ] 在 ThemeManager 中支持自定义错误消息

### 工作量估算

- 错误消息更新: 2 小时
- i18n 接口设计: 2 小时
- 文档更新: 2 小时
- **总计**: 1 天

---

## 修复顺序建议

### 阶段 1: 快速修复（半天）
1. **H2: React 扩展设计** - 文档更新（已完成大部分）
2. **H4: 回滚计划** - 流程设计

### 阶段 2: 核心功能（1-2天）
3. **H1: CLI 职责** - 明确定位
4. **H5: 防闪烁机制** - 设计内联方案
5. **H3: 快速原型** - 添加验证路径

### 阶段 3: 开发者体验（2-3天）
6. **H6: 快速开始示例** - 创建示例代码
7. **H7: 错误消息国际化** - 统一使用英文

**总时间线**: 5-7 天

---

## 验证检查清单

修复完成后，执行以下检查：

### H1 验证
- [ ] CLI 定位明确（脚手架工具）
- [ ] package.json 依赖正确（devDependencies）
- [ ] `npx create-ouraihub-app` 可用

### H2 验证
- [ ] 框架扩展路径文档完整
- [ ] 主文档中有扩展路径引用

### H3 验证
- [ ] 路线图包含 Batch 0.5
- [ ] 快速原型可运行

### H4 验证
- [ ] 验证门禁机制已定义
- [ ] 回滚策略已文档化
- [ ] Git 标签已创建

### H5 验证
- [ ] 内联脚本机制已设计
- [ ] T7 任务已更新
- [ ] 使用示例已创建

### H6 验证
- [ ] `examples/` 目录存在
- [ ] 至少 4 个示例可运行
- [ ] 快速开始文档已更新

### H7 验证
- [ ] 所有错误消息使用英文
- [ ] i18n 接口已定义
- [ ] 错误处理文档已更新

---

## 相关文档

- [Critical 问题修复计划](./03-critical-fixes.md) - Critical 级别问题
- [实施路线图](./01-roadmap.md) - 完整路线图
- [框架扩展路径](../architecture/06-framework-extension.md) - React/Vue/Svelte 扩展

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-12
