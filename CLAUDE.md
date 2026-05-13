# @ouraihub/ui-library 项目指南

> 本文档帮助 AI 助手快速理解项目背景、架构设计和开发规范。

## 项目概览

**@ouraihub/ui-library** 是一个为多个前端项目（Hugo 主题和 Astro 项目）设计的可复用组件库。

### 核心目标

- 📦 **代码复用**: 提取 ~2,850-4,000 行重复代码，实现 70%+ 复用率
- 🔧 **维护成本**: 降低 75% 维护成本（修复一次，全部生效）
- ⚡ **开发效率**: 提升 300%（实现一次，多处复用）
- 🎯 **一致性**: 统一实现，统一体验

### 技术栈

- **语言**: TypeScript（100% 类型覆盖）
- **样式**: Tailwind CSS v4 + CSS 变量
- **构建**: esbuild + Turborepo
- **测试**: Vitest + Playwright
- **包管理**: pnpm workspace

---

## 架构设计

### 核心架构：六层架构

本项目采用**六层架构设计**，每层职责单一、边界清晰。详见 [ADR-005: 六层架构设计](docs/decisions/005-six-layer-architecture.md)。

```
Layer 6: Ecosystem（生态系统层）
    ↓
Layer 5: Themes（完整主题层）
    ↓
Layer 4: Presets（预设层）
    ↓
Layer 3: Framework Base（框架基础层）
    ↓
Layer 2: Components（组件包装层）
    ↓
Layer 1: Primitives（核心原语层）
    ↓
Layer 0: Design Tokens（设计令牌层）
```

#### 各层职责

- **Layer 0: Design Tokens** - 设计令牌（颜色、间距、字体、阴影等）
- **Layer 1: Primitives** - 核心原语（纯 TypeScript 类，100% 跨框架复用）
- **Layer 2: Components** - 组件包装（Hugo partials + Astro 组件）
- **Layer 3: Framework Base** - 框架基础（布局模板、样式系统、配置示例）
- **Layer 4: Presets** - 预设层（配置 + 插件 + 工具的预设组合）
- **Layer 5: Themes** - 完整主题（开箱即用的完整主题）
- **Layer 6: Ecosystem** - 生态系统（CLI、VSCode 扩展、文档站点）

**关键决策**:
- ✅ **核心逻辑**: 纯 TypeScript 类（Layer 1，100% 跨框架复用）
- ✅ **UI 层**: 框架专用薄包装（Layer 2，Hugo partials + Astro 组件）
- ✅ **设计系统**: 统一的设计令牌（Layer 0，支持多主题和多品牌）
- ✅ **快速启动**: 预设系统（Layer 4，提供最佳实践）
- ❌ **不使用 Web Components**: SSG + Tailwind v4 场景不适合，SEO 不友好

**详细说明**: 参见 `docs/decisions/005-six-layer-architecture.md`

### Monorepo 结构

```
@ouraihub/ui-library/
├── packages/
│   ├── tokens/         # Layer 0: 设计令牌
│   ├── core/           # Layer 1: 核心原语（纯 TypeScript）
│   ├── utils/          # Layer 1: 工具函数
│   ├── hugo/           # Layer 2: Hugo 组件包装
│   ├── astro/          # Layer 2: Astro 组件包装
│   ├── hugo-base/      # Layer 3: Hugo 框架基础
│   ├── astro-base/     # Layer 3: Astro 框架基础
│   ├── preset-blog/    # Layer 4: 博客预设
│   ├── preset-docs/    # Layer 4: 文档预设
│   ├── hugo-theme-*/   # Layer 5: Hugo 完整主题
│   ├── astro-theme-*/  # Layer 5: Astro 完整主题
│   └── cli/            # Layer 6: CLI 工具
├── docs/               # 完整设计文档
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

---

## 核心组件

### P0 组件（必须实现）

1. **ThemeManager** - 主题切换系统
   - light/dark/system 三态切换
   - localStorage 持久化
   - 媒体查询监听
   - 防闪烁机制

2. **DOM 工具函数**
   - querySelector/querySelectorAll 封装
   - debounce/throttle 函数
   - 事件委托

3. **CSS 变量系统**
   - 统一设计令牌（颜色、间距、字体）
   - 暗色主题支持

### P1 组件（强烈建议）

4. **NavigationController** - 导航菜单
5. **LazyLoader** - 懒加载功能
6. **SearchModal** - 搜索功能

**完整列表**: 参见 `docs/DESIGN.md` 第 1.1 节

---

## 开发规范

### 1. 代码风格

**TypeScript**:
- 使用 `strict` 模式
- 禁止 `any`、`@ts-ignore`、`@ts-expect-error`
- 优先使用类型推断，复杂类型显式声明
- 导出所有公共类型

**命名约定**:
- 类名: `PascalCase`（如 `ThemeManager`）
- 函数/变量: `camelCase`（如 `setTheme`）
- 常量: `UPPER_SNAKE_CASE`（如 `DEFAULT_THEME`）
- 私有成员: 前缀 `_`（如 `_storageKey`）

**详细规范**: 参见 `docs/guides/code-style.md`

### 2. 架构原则

**简洁优先**:
- 不要添加未被要求的功能
- 不要为单次使用的代码创建抽象
- 不要添加未被要求的"灵活性"或"可配置性"
- 如果 200 行代码可以用 50 行实现，重写它

**外科手术式修改**:
- 只修改必须修改的代码
- 不要"改进"相邻代码、注释或格式
- 不要重构没有问题的代码
- 匹配现有代码风格，即使你会用不同方式实现

**类型安全**:
- 永远不要使用 `as any`、`@ts-ignore`、`@ts-expect-error`
- 永远不要使用空的 catch 块 `catch(e) {}`
- 永远不要删除失败的测试来"通过"测试

### 3. 测试策略

**测试金字塔**:
- 单元测试: 70%（核心逻辑）
- 集成测试: 20%（组件交互）
- E2E 测试: 10%（用户流程）

**覆盖率目标**:
- 核心逻辑（`@ouraihub/core`）: 90%+
- UI 包装层: 70%+

**详细策略**: 参见 `docs/testing/README.md`

### 4. 提交规范

**Commit 消息格式**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型**:
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档变更
- `style`: 代码格式（不影响功能）
- `refactor`: 重构（不是新功能也不是修复）
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例**:
```
feat(core): 添加 ThemeManager 类

- 实现 light/dark/system 三态切换
- 添加 localStorage 持久化
- 添加媒体查询监听

Closes #123
```

---

## 文档导航

### 快速开始
- 📖 [README.md](docs/README.md) - 文档索引和快速导航
- 🚀 [快速开始指南](docs/implementation/02-quick-start.md) - 30 分钟创建第一个组件
- ⭐ [完整设计方案](docs/DESIGN.md) - 技术方案和架构设计

### 架构决策（ADR）
- 🏗️ [ADR-001: 混合架构](docs/decisions/001-hybrid-architecture.md) - 为什么选择混合架构
- 🚫 [ADR-002: 不使用 Web Components](docs/decisions/002-no-web-components.md) - Web Components 的权衡
- 🎨 [ADR-003: CSS 变量方案](docs/decisions/003-css-variables-over-css-in-js.md) - 样式系统选择
- 📦 [ADR-004: Monorepo 结构](docs/decisions/004-monorepo-structure.md) - 包结构设计

### 实施指南
- 📋 [实施路线图](docs/implementation/01-roadmap.md) - 完整开发计划
- 🔧 [API 参考](docs/api/README.md) - 核心类和工具函数 API
- 🧪 [测试策略](docs/testing/README.md) - 测试金字塔和覆盖率目标
- 🚀 [部署指南](docs/deployment/README.md) - npm 发布和 CI/CD

### 开发指南
- 📝 [代码规范](docs/guides/code-style.md) - TypeScript、CSS、命名约定
- 🔒 [安全性](docs/guides/security.md) - XSS 防护、输入验证
- ⚡ [性能优化](docs/guides/performance.md) - 包体积、代码分割、懒加载
- 🔧 [故障排查](docs/guides/troubleshooting.md) - 常见问题和调试技巧

### 分析报告
- 📊 [项目概览](docs/analysis/01-projects-overview.md) - 4 个项目的技术栈对比
- 🔥 [代码重复分析](docs/analysis/02-code-duplication.md) - 重复代码清单（~2,850-4,000 行）
- 📖 [项目详细分析](docs/analysis/03-project-details.md) - 每个项目的深度分析

---

## 工作流程

### 开发新组件

1. **阅读文档** - 先阅读 `docs/DESIGN.md` 了解整体设计
2. **查看 API** - 参考 `docs/api/README.md` 了解现有 API 模式
3. **编写测试** - 先写测试，定义成功标准
4. **实现功能** - 在 `packages/core/src/` 中实现核心逻辑
5. **创建包装** - 在 `packages/hugo/` 和 `packages/astro/` 中创建薄包装
6. **运行测试** - 确保所有测试通过
7. **检查类型** - 运行 `pnpm typecheck` 确保类型安全
8. **更新文档** - 更新 API 文档和使用示例

### 修复 Bug

1. **重现问题** - 先写一个失败的测试来重现 bug
2. **最小化修改** - 只修改必须修改的代码
3. **验证修复** - 确保测试通过
4. **回归测试** - 运行完整测试套件
5. **更新文档** - 如果影响 API，更新文档

### 重构代码

1. **确保测试覆盖** - 重构前确保有足够的测试
2. **小步迭代** - 每次只重构一小部分
3. **保持测试通过** - 每次修改后运行测试
4. **不改变行为** - 重构不应改变外部行为
5. **更新文档** - 如果影响 API，更新文档

---

## 常见问题

### Q: 为什么不使用 Web Components？

**A**: 在 SSG + Tailwind v4 场景下，Web Components 有以下问题：
- SSG 场景下 SEO 不友好（内容在 JS 执行后才渲染）
- Tailwind v4 与 Shadow DOM 集成复杂
- 需要 Declarative Shadow DOM（浏览器支持有限）
- 初始化时机问题（需要等待 JS 加载）

详见 `docs/decisions/002-no-web-components.md`

### Q: 如何在新项目中使用组件库？

**A**: 参考 `docs/implementation/02-quick-start.md`，30 分钟即可完成：
1. 创建 Monorepo
2. 配置 Turborepo
3. 提取第一个组件（ThemeManager）
4. 在项目中使用

### Q: 如何贡献代码？

**A**: 
1. 阅读 `docs/guides/code-style.md` 了解代码规范
2. 遵循 `docs/testing/README.md` 中的测试策略
3. 提交前运行 `pnpm test` 和 `pnpm typecheck`
4. 使用规范的 commit 消息格式

### Q: 如何发布新版本？

**A**: 参考 `docs/deployment/README.md`：
1. 更新版本号（遵循 SemVer）
2. 更新 CHANGELOG
3. 运行完整测试套件
4. 构建所有包
5. 发布到 npm

---

## 项目状态

**当前阶段**: 📝 设计和文档阶段

**已完成**:
- ✅ 项目分析和代码重复识别
- ✅ 架构设计和技术选型
- ✅ 完整文档体系（28+ 文档）
- ✅ ADR（架构决策记录）
- ✅ API 设计和测试策略

**下一步**:
- 🔄 创建 Monorepo 基础架构
- 🔄 实现 P0 组件（ThemeManager、DOM 工具、CSS 变量）
- 🔄 编写单元测试和集成测试
- 🔄 创建 Hugo 和 Astro 包装层

**详细计划**: 参见 `docs/implementation/01-roadmap.md`

---

## 联系方式

- **文档维护**: Sisyphus (AI Agent)
- **项目所有者**: [项目所有者名称]
- **文档版本**: v1.6.0
- **最后更新**: 2026-05-12

---

## 附录：Karpathy 行为准则

为了减少常见的 LLM 编码错误，请遵循以下准则：

### 1. 思考后再编码

**不要假设。不要隐藏困惑。展示权衡。**

实施前：
- 明确陈述你的假设。如果不确定，询问。
- 如果存在多种解释，展示它们 - 不要默默选择。
- 如果存在更简单的方法，说出来。必要时提出反对意见。
- 如果有不清楚的地方，停下来。说明困惑的地方。询问。

### 2. 简洁优先

**解决问题的最少代码。不要推测。**

- 不要添加未被要求的功能
- 不要为单次使用的代码创建抽象
- 不要添加未被要求的"灵活性"或"可配置性"
- 不要为不可能的场景添加错误处理
- 如果写了 200 行但 50 行就够，重写它

问自己："资深工程师会说这太复杂吗？"如果是，简化它。

### 3. 外科手术式修改

**只修改必须修改的。只清理自己的混乱。**

编辑现有代码时：
- 不要"改进"相邻代码、注释或格式
- 不要重构没有问题的代码
- 匹配现有风格，即使你会用不同方式
- 如果注意到无关的死代码，提及它 - 不要删除它

当你的修改产生孤儿时：
- 删除你的修改导致未使用的导入/变量/函数
- 不要删除预先存在的死代码，除非被要求

测试：每一行修改都应该直接追溯到用户的请求。

### 4. 目标驱动执行

**定义成功标准。循环直到验证。**

将任务转换为可验证的目标：
- "添加验证" → "为无效输入编写测试，然后让它们通过"
- "修复 bug" → "编写重现它的测试，然后让它通过"
- "重构 X" → "确保测试在前后都通过"

对于多步骤任务，陈述简要计划：
```
1. [步骤] → 验证: [检查]
2. [步骤] → 验证: [检查]
3. [步骤] → 验证: [检查]
```

强成功标准让你独立循环。弱标准（"让它工作"）需要持续澄清。

---

**这些准则有效的标志**：diff 中不必要的修改更少，因过度复杂而重写的次数更少，澄清问题在实施前而不是错误后出现。
