# ADR-006: 采用 daisyUI 作为可选 UI 皮肤层

**状态**: 已接受  
**日期**: 2026-05-18  
**决策者**: Sisyphus (AI Agent)  
**相关文档**: [六层架构设计](./005-six-layer-architecture.md) | [组件库架构设计](../architecture/02-component-library-design.md) | [daisyUI 安装](https://daisyui.com/docs/install/?lang=en) | [daisyUI 主题](https://daisyui.com/docs/themes/)

---

## 背景

当前仓库的 UI 组件主要还是手写 HTML + CSS：

- `theme-toggle`
- `search-modal`
- `navigation`
- `utilities.css`

这套方式的优点是可控、跨框架、和现有 `CSS 变量 + Tailwind` 体系一致；但缺点也很明显：

1. 标准控件的样式重复多。
2. 维护多个站点时，按钮、输入框、弹窗、导航的视觉一致性成本高。
3. `utilities.css` 已经包含 `.container`、`.flex`、`.hidden` 这类全局类，后续更容易和组件样式冲突。
4. 我们不希望把核心逻辑、token 系统和框架包装层绑定到某个重 JS 运行时方案上。

---

## 决策

将 `daisyUI` 作为**可选的 UI 皮肤层**，只负责标准化组件的默认外观，不替代现有架构。

### 采用范围

- Button
- Input
- Modal / Drawer
- Navbar / Menu
- Badge / Card / Dropdown / Toggle
- 基础主题切换外观

### 不纳入范围

- `@ouraihub/core` 的行为逻辑
- 设计令牌的语义命名
- SEO、搜索、导航状态管理等核心逻辑
- Hugo / Astro 的薄包装职责
- 需要强定制交互的复杂组件业务逻辑

### 集成原则

1. `@ouraihub/tokens` 继续作为唯一的设计令牌来源。
2. `daisyUI` 只负责默认外观和通用组件类名。
3. 通过 theme/token 映射控制品牌色、背景色、文字色。
4. 以 preset / theme 的方式按需启用，不强制所有项目接入。

---

## 理由

### 1. 能显著减少标准控件样板

`daisyUI` 提供按钮、表单、弹窗、菜单等常见组件的统一类名，可以直接覆盖我们目前大量重复的基础样式。

### 2. 仍然满足跨框架和 SSG 场景

`daisyUI` 是 Tailwind 的插件，纯 CSS 方案，适合 Hugo、Astro 这类 SSG / 半静态场景。

### 3. 能保留现有 token 体系

我们不想放弃已经建立的 `CSS 变量 + Tailwind preset` 结构。`daisyUI` 只作为默认皮肤，不作为设计系统的唯一来源。

### 4. 降低“库锁定”的风险

如果后续要切换视觉风格，仍然可以通过 token 映射和局部覆盖来调整，而不是把业务逻辑重新写一遍。

---

## 后果

### 正面影响

1. 标准控件实现更快。
2. 组件样式更统一。
3. 主题切换和暗色模式更容易落地。
4. Hugo 和 Astro 可以共享同一套视觉基线。

### 负面影响

1. 视觉风格会更受 `daisyUI` 影响。
2. 需要处理现有全局类名冲突。
3. 复杂组件仍需要自定义样式。
4. 如果未来完全切换风格，需要维护一层映射。

### 缓解措施

1. 先在 `preset-docs` 或 `preset-blog` 做试点。
2. 优先迁移按钮、输入框、导航、弹窗。
3. 保留 `SEO`、`Search`、`ThemeManager` 等核心逻辑的自定义实现。
4. 把 `daisyUI` 视为“皮肤层”，不是“架构层”。

---

## 替代方案

### 方案 A: 全面替换成 daisyUI

**优点**：
- 上手最快
- 样式最统一

**缺点**：
- 视觉风格更容易被框架化
- 复杂组件仍会产生二次定制成本

**为什么没选**：会过度约束现有架构，不利于保留我们的 token 和包装层设计。

### 方案 B: 完全不引入，继续手写组件

**优点**：
- 完全可控
- 风格自由度最高

**缺点**：
- 重复样式会继续累积
- 标准控件的维护成本高

**为什么没选**：不符合“降低重复、提升统一性”的目标。

### 方案 C: 仅在预设层中启用（已选择）

**优点**：
- 保留现有架构
- 适合渐进式迁移
- 便于试点和回滚

**缺点**：
- 需要额外维护一层启用开关

**为什么选择**：这是平衡复用性、可控性和迁移成本的最优解。

---

## 实施建议

1. 先在 `preset-docs` 或 `preset-blog` 做一个试点。
2. 先迁移标准控件，再看是否需要扩大范围。
3. 保持 `@ouraihub/core` 和 `@ouraihub/tokens` 不变。
4. 用文档和示例验证视觉一致性，再决定是否正式纳入默认预设。

---

## 参考资料

- [daisyUI Home](https://daisyui.com/)
- [daisyUI Install](https://daisyui.com/docs/install/?lang=en)
- [daisyUI Themes](https://daisyui.com/docs/themes/)
- [Tailwind CSS Presets](https://tailwindcss.com/docs/presets)
- [六层架构设计](./005-six-layer-architecture.md)

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-18
