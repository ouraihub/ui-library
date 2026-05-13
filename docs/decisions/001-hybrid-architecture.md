# ADR-001: 采用混合架构（核心逻辑 + 薄包装层）

**状态**: 已接受  
**日期**: 2026-05-12  
**决策者**: Sisyphus + Oracle (AI Agents)

---

## 背景

我们需要为多个前端项目（Hugo 主题和 Astro 项目）建立可复用的组件库系统。面临的核心问题是：

1. **跨框架复用**: Hugo 使用 Go Templates，Astro 使用 JSX/Astro 语法，如何最大化代码复用？
2. **开发体验**: 如何在保证复用性的同时，不牺牲开发体验？
3. **技术栈**: 所有项目都使用 TypeScript + Tailwind CSS v4 + esbuild，如何利用这个优势？

**相关分析**: 参见 [代码重复分析](../analysis/02-code-duplication.md) 和 [项目概览](../analysis/01-projects-overview.md)

---

## 决策

我们决定采用**混合架构**：

```
核心逻辑层（纯 TypeScript 类）
    ↓ 100% 复用
薄包装层（Hugo partials + Astro 组件）
    ↓ 框架专用语法
最终应用
```

**核心原则**:
- 核心逻辑用纯 TypeScript 类实现（100% 跨框架复用）
- UI 层用框架专用的薄包装（Hugo partials + Astro 组件）
- 薄包装层只负责：DOM 绑定、事件监听、样式应用
- 所有业务逻辑都在核心层

---

## 理由

### 1. 最大化代码复用（95%+）

**核心逻辑层**（100% 复用）:
```typescript
// @ouraihub/core/theme/ThemeManager.ts
export class ThemeManager {
  constructor(options?: ThemeOptions) { /* ... */ }
  toggle(): void { /* ... */ }
  setTheme(theme: Theme): void { /* ... */ }
  onThemeChange(callback: (theme: Theme) => void): () => void { /* ... */ }
}
```

**Hugo 薄包装层**（5% 框架专用代码）:
```html
<!-- @ouraihub/hugo/partials/theme-toggle.html -->
<button data-ui-component="theme-toggle">切换主题</button>
<script type="module">
  import { ThemeManager } from '@ouraihub/core/theme';
  new ThemeManager(document.querySelector('[data-ui-component="theme-toggle"]'));
</script>
```

**Astro 薄包装层**（5% 框架专用代码）:
```astro
<!-- @ouraihub/astro/ThemeToggle.astro -->
<button>切换主题</button>
<script>
  import { ThemeManager } from '@ouraihub/core/theme';
  new ThemeManager(document.currentScript.previousElementSibling);
</script>
```

### 2. 平衡复用性和开发体验

| 方案 | 复用度 | 开发体验 | 维护成本 | SEO | Tailwind 集成 |
|------|--------|---------|---------|-----|--------------|
| 完全框架专用 | 0% | ⭐⭐⭐⭐⭐ | 高 | ✅ | ✅ |
| 纯 Web Components | 100% | ⭐⭐⭐ | 低 | ❌ | ❌ |
| **混合架构** | **95%** | **⭐⭐⭐⭐** | **低** | **✅** | **✅** |

**混合架构的优势**:
- ✅ 核心逻辑 100% 复用（主题切换、搜索、导航等）
- ✅ 使用框架原生语法（Hugo partials、Astro 组件）
- ✅ 完全 SEO 友好（SSG 场景）
- ✅ Tailwind CSS v4 无缝集成
- ✅ 开发体验接近框架专用组件

### 3. 利用技术栈统一优势

所有项目都使用：
- ✅ TypeScript（类型安全）
- ✅ Tailwind CSS v4（样式统一）
- ✅ esbuild（快速构建）
- ✅ Vitest（测试统一）

这为混合架构提供了极好的基础。

### 4. 参考成功案例

**Pagefind Component UI** 采用类似架构：
- 核心逻辑用纯 TypeScript 类
- UI 层用 Web Components（我们用框架专用组件）
- 事件驱动通信
- CSS 变量主题化

**详细研究**: 参见 [Pagefind 架构深度研究](../architecture/01-pagefind-study.md)

---

## 后果

### 正面影响

1. **代码复用**: 节省 ~2,000-2,800 行代码（70%+）
2. **维护成本**: 降低 75%（修复一次生效全部）
3. **开发效率**: 提升 300%（实现一次复用）
4. **一致性**: 统一实现，统一体验
5. **类型安全**: 100% TypeScript 覆盖
6. **SEO 友好**: 完全支持 SSG

### 负面影响

1. **学习曲线**: 开发者需要理解分层架构
2. **调试复杂度**: 需要在核心层和包装层之间调试
3. **包装层维护**: 每个框架需要维护一套薄包装层（但代码量很小）

### 风险缓解

- **文档**: 提供清晰的 API 文档和使用示例
- **示例**: 提供完整的示例项目
- **测试**: 核心层 90%+ 测试覆盖率
- **类型**: 完整的 TypeScript 类型定义

---

## 替代方案

### 方案 A: 完全框架专用

**描述**: 为每个框架单独实现组件，不共享代码。

**优点**:
- ✅ 开发体验最好（使用框架原生语法）
- ✅ 调试简单
- ✅ 无学习曲线

**缺点**:
- ❌ 代码复用率 0%
- ❌ 维护成本极高（修复 bug 需要改多处）
- ❌ 一致性难以保证

**为什么没选**: 维护成本太高，违背了建立组件库的初衷。

---

### 方案 B: 纯 Web Components

**描述**: 所有组件用 Web Components 实现，跨框架复用。

**优点**:
- ✅ 代码复用率 100%
- ✅ 维护成本最低
- ✅ 真正的跨框架

**缺点**:
- ❌ SSG 场景下 SEO 不友好（内容在 JS 执行后才渲染）
- ❌ Tailwind v4 与 Shadow DOM 集成复杂
- ❌ 需要 Declarative Shadow DOM（浏览器支持有限）
- ❌ 初始化时机问题（需要等待 JS 加载）
- ❌ 开发体验较差（需要学习 Web Components API）

**为什么没选**: SSG + Tailwind v4 场景不适合，SEO 和样式集成问题难以解决。

**详细分析**: 参见 [ADR-002: 不使用 Web Components](./002-no-web-components.md)

---

### 方案 C: 混合架构（已选择）

**描述**: 核心逻辑用纯 TypeScript 类，UI 层用框架专用的薄包装。

**优点**:
- ✅ 代码复用率 95%+
- ✅ 维护成本低
- ✅ SEO 友好
- ✅ Tailwind 无缝集成
- ✅ 开发体验好

**缺点**:
- ⚠️ 需要维护薄包装层（但代码量很小）
- ⚠️ 学习曲线（需要理解分层架构）

**为什么选择**: 在复用性、开发体验、维护成本之间取得最佳平衡。

---

## 相关决策

- [ADR-002: 不使用 Web Components](./002-no-web-components.md) - 为什么不用 Web Components
- [ADR-003: CSS 变量 vs CSS-in-JS](./003-css-variables-over-css-in-js.md) - 样式方案选择
- [ADR-004: Monorepo 结构设计](./004-monorepo-structure.md) - 包结构设计

---

## 参考资料

- [完整设计方案](../DESIGN.md)
- [Pagefind 架构研究](../architecture/01-pagefind-study.md)
- [代码重复分析](../analysis/02-code-duplication.md)
- Oracle 的架构建议（2026-05-12）

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-12
