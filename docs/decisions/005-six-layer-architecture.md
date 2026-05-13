# ADR-005: 六层架构设计

**状态**: 已接受  
**日期**: 2026-05-12  
**决策者**: Sisyphus (AI Agent)  
**相关文档**: [架构评审报告](../ARCHITECTURE_REVIEW.md) | [完整设计方案](../DESIGN.md)

---

## 背景

在完成初始的三层架构设计（组件层、框架层、主题层）后，通过深度评审发现当前架构过于简单，缺少现代前端组件库应有的层次和工具链。

参考了以下优秀开源项目：
- **Shadcn/ui**: CLI 驱动的组件复制模式
- **Radix UI**: 无样式原语组件
- **Chakra UI**: 完整的设计令牌系统
- **Tailwind CSS**: Preset 预设系统
- **Material-UI**: 主题提供者模式

**核心问题**：
1. 缺少设计令牌层，导致主题定制困难
2. 缺少预设层，导致项目启动配置繁琐
3. 缺少生态系统层，导致开发者体验不佳
4. 层次职责不够清晰

---

## 决策

将三层架构扩展为**六层架构**，每层职责单一、边界清晰。

### 架构层次

```
Layer 6: Ecosystem（生态系统层）
    ↓
Layer 5: Themes（完整主题层）
    ↓
Layer 4: Presets（预设层）⭐ 新增
    ↓
Layer 3: Framework Base（框架基础层）
    ↓
Layer 2: Components（组件包装层）
    ↓
Layer 1: Primitives（核心原语层）
    ↓
Layer 0: Design Tokens（设计令牌层）⭐ 新增
```

### 各层职责

#### Layer 0: Design Tokens（设计令牌层）
**包**: `@ouraihub/tokens`

**职责**：
- 定义设计系统的基础令牌（颜色、间距、字体、阴影等）
- 提供多主题支持（light、dark、custom）
- 支持品牌定制

**示例**：
```typescript
export const tokens = {
  colors: {
    brand: { 50: '#f0f9ff', 100: '#e0f2fe', ... },
    gray: { 50: '#f9fafb', 100: '#f3f4f6', ... }
  },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', ... },
  typography: { fontFamily: { sans: '...', mono: '...' } },
  shadows: { sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', ... }
}
```

**参考**: Chakra UI Tokens、Tailwind Config

---

#### Layer 1: Primitives（核心原语层）
**包**: `@ouraihub/core`, `@ouraihub/utils`

**职责**：
- 纯 TypeScript 核心逻辑（100% 跨框架复用）
- 零依赖、Tree-shakable
- 提供行为逻辑，不涉及 UI

**示例**：
```typescript
// @ouraihub/core
export class ThemeManager { ... }
export class NavigationController { ... }

// @ouraihub/utils
export function debounce() { ... }
export function throttle() { ... }
```

**设计模式**：
- 策略模式（存储策略）
- 观察者模式（事件系统）
- 工厂模式（实例创建）

---

#### Layer 2: Components（组件包装层）
**包**: `@ouraihub/hugo`, `@ouraihub/astro`, `@ouraihub/react`（未来）

**职责**：
- 框架特定的薄包装
- 将核心逻辑适配为框架组件
- 保持最小化，只做适配

**示例**：
```html
<!-- @ouraihub/hugo -->
{{ partial "theme-toggle.html" . }}

<!-- @ouraihub/astro -->
<ThemeToggle client:load />
```

**设计模式**：适配器模式

---

#### Layer 3: Framework Base（框架基础层）
**包**: `@ouraihub/hugo-base`, `@ouraihub/astro-base`

**职责**：
- 提供布局模板
- 集成样式系统
- 提供配置示例
- 可定制、可继承

**包含**：
- layouts/（布局模板）
- components/（组件集成）
- styles/（样式系统）
- config/（配置示例）

---

#### Layer 4: Presets（预设层）⭐ 新增
**包**: `@ouraihub/preset-blog`, `@ouraihub/preset-docs`, `@ouraihub/preset-portfolio`

**职责**：
- 配置 + 插件 + 工具的预设组合
- 提供特定场景的最佳实践
- 可组合、可覆盖

**示例**：
```typescript
// @ouraihub/preset-blog
export default {
  tokens: { /* 博客风格的令牌 */ },
  plugins: [
    '@ouraihub/plugin-seo',
    '@ouraihub/plugin-analytics',
    '@ouraihub/plugin-rss'
  ],
  components: ['ThemeToggle', 'SearchModal', 'TableOfContents'],
  layouts: ['post', 'archive', 'about']
}
```

**参考**: Tailwind Presets

---

#### Layer 5: Themes（完整主题层）
**包**: `@ouraihub/hugo-theme-blog`, `@ouraihub/astro-theme-docs`

**职责**：
- 开箱即用的完整主题
- 基于 Preset 构建
- 零配置启动

**特点**：
- 完整的设计
- 预配置的插件
- 示例内容

---

#### Layer 6: Ecosystem（生态系统层）
**工具**: CLI、VSCode 扩展、浏览器扩展、文档站点

**职责**：
- 提升开发者体验
- 自动化工作流
- 社区建设

**包含**：
- `create-ouraihub-app`: CLI 脚手架
- `@ouraihub/devtools`: 浏览器扩展
- `@ouraihub/vscode`: VSCode 扩展
- 文档站点 + Playground
- Discord 社区 + Blog

**参考**: Shadcn/ui CLI、React DevTools

---

## 理由

### 1. 为什么需要 Design Tokens 层？

**问题**：当前 CSS 变量分散在各处，主题定制困难

**解决**：
- 统一的设计令牌系统
- 支持多品牌、多主题
- 设计和代码同步

**参考**: Chakra UI 的 tokens 系统非常成熟，支持语义化令牌（如 `colors.primary`）和原始令牌（如 `colors.blue.500`）

### 2. 为什么需要 Preset 层？

**问题**：用户需要手动配置大量选项才能启动项目

**解决**：
- 预设组合了最佳实践
- 快速启动特定类型项目
- 可组合、可覆盖

**参考**: Tailwind 的 preset 系统允许共享配置，非常灵活

### 3. 为什么需要 Ecosystem 层？

**问题**：缺少工具支持，开发者体验差

**解决**：
- CLI 降低上手门槛
- Dev Tools 提升调试效率
- 文档和社区提供支持

**参考**: Shadcn/ui 的 CLI 非常成功，通过 `npx shadcn-ui add button` 就能添加组件

---

## 后果

### 正面影响

1. **更清晰的职责划分**
   - 每层职责单一
   - 边界清晰
   - 易于理解和维护

2. **更好的灵活性**
   - 用户可以选择使用哪一层
   - 渐进式采用
   - 定制更简单

3. **更好的开发者体验**
   - CLI 降低上手门槛
   - Preset 提供最佳实践
   - Dev Tools 提升效率

4. **更强的生态系统**
   - 插件系统支持扩展
   - 社区可以贡献
   - 可持续发展

### 负面影响

1. **复杂度增加**
   - 更多的包需要维护
   - 更多的文档需要编写
   - 学习曲线略微增加

2. **开发时间延长**
   - 需要更多时间实现
   - 需要更多测试
   - 需要更多文档

3. **维护成本增加**
   - 更多的包需要发布
   - 更多的版本需要管理
   - 更多的 issue 需要处理

### 缓解措施

1. **分阶段实施**
   - Phase 1: 核心功能（Layer 0-2）
   - Phase 2: 框架层（Layer 3-4）
   - Phase 3: 生态系统（Layer 5-6）

2. **自动化工具**
   - Changesets 自动化版本管理
   - Turborepo 优化构建
   - GitHub Actions 自动化发布

3. **清晰的文档**
   - 每层都有独立文档
   - 提供迁移指南
   - 提供示例项目

---

## 替代方案

### 方案 A: 保持三层架构

**优点**：
- 简单
- 快速实现
- 维护成本低

**缺点**：
- 灵活性差
- 定制困难
- 开发者体验一般

**为什么不选**：不符合现代前端组件库的标准，长期来看会限制发展

### 方案 B: 直接采用 Web Components

**优点**：
- 真正的跨框架
- 浏览器原生支持
- 封装性好

**缺点**：
- SSG 场景 SEO 不友好
- Tailwind v4 集成困难
- 浏览器兼容性问题

**为什么不选**：已在 ADR-002 中详细分析，不适合我们的场景

### 方案 C: 只提供 CLI，不提供 npm 包

**优点**：
- 用户完全控制代码
- 定制非常灵活
- 类似 Shadcn/ui

**缺点**：
- 升级困难
- 无法享受 npm 生态
- 维护成本高

**为什么不选**：我们采用混合方式 - 核心逻辑通过 npm，UI 组件可选复制

---

## 实施计划

### Phase 1: 核心功能（2 周）
- [ ] @ouraihub/tokens 设计令牌
- [ ] @ouraihub/core 核心原语
- [ ] @ouraihub/hugo 和 @ouraihub/astro 包装
- [ ] 基础测试和文档

### Phase 2: 框架层（2-4 周）
- [ ] @ouraihub/hugo-base 和 @ouraihub/astro-base
- [ ] @ouraihub/preset-blog 和 @ouraihub/preset-docs
- [ ] Storybook 组件展示
- [ ] E2E 测试

### Phase 3: 生态系统（4-8 周）
- [ ] create-ouraihub-app CLI
- [ ] 完整主题（至少 2 个）
- [ ] 文档站点 + Playground
- [ ] 社区建设

### Phase 4: 高级功能（8+ 周）
- [ ] 插件系统
- [ ] VSCode 扩展
- [ ] 浏览器 DevTools
- [ ] i18n 支持

---

## 参考资料

- [Shadcn/ui Architecture](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Chakra UI Design Tokens](https://chakra-ui.com/docs/styled-system/theme)
- [Tailwind CSS Presets](https://tailwindcss.com/docs/presets)
- [Material-UI Theming](https://mui.com/material-ui/customization/theming/)

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-12
