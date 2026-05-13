# ADR-002: 不使用 Web Components

**状态**: 已接受  
**日期**: 2026-05-12  
**决策者**: Sisyphus + Oracle (AI Agents)

---

## 背景

在设计跨框架组件库时，Web Components 是一个自然的选择：

- ✅ 原生浏览器支持
- ✅ 真正的跨框架复用
- ✅ 封装性好（Shadow DOM）
- ✅ 标准化（W3C 标准）

但我们的项目有特殊场景：
1. **SSG（静态站点生成）**: Hugo 和 Astro 都是 SSG 工具
2. **Tailwind CSS v4**: 所有项目都使用 Tailwind v4
3. **SEO 优先**: 内容需要在 HTML 中直接可见
4. **性能优先**: 首屏渲染不能依赖 JS

**问题**: Web Components 在这个场景下是否合适？

---

## 决策

我们决定**不使用 Web Components**，而是采用混合架构（核心逻辑 + 薄包装层）。

**核心原因**:
1. SSG + Tailwind v4 场景下，Web Components 的缺点大于优点
2. 混合架构能达到 95% 复用率，接近 Web Components 的 100%
3. 混合架构在 SEO、样式集成、开发体验上更优

---

## 理由

### 1. SSG 场景下的 SEO 问题

**Web Components 的问题**:
```html
<!-- 初始 HTML（搜索引擎看到的） -->
<theme-toggle></theme-toggle>

<!-- JS 执行后（用户看到的） -->
<theme-toggle>
  #shadow-root
    <button>切换主题</button>
</theme-toggle>
```

**问题**:
- ❌ 内容在 Shadow DOM 中，初始 HTML 为空
- ❌ 搜索引擎需要等待 JS 执行（不可靠）
- ❌ 首屏渲染依赖 JS（性能问题）

**Declarative Shadow DOM 的局限**:
```html
<!-- 需要手动编写 -->
<theme-toggle>
  <template shadowrootmode="open">
    <button>切换主题</button>
  </template>
</theme-toggle>
```

**问题**:
- ⚠️ 浏览器支持有限（Safari 16.4+, Firefox 123+）
- ⚠️ SSG 工具需要特殊支持（Hugo 不支持）
- ⚠️ 开发体验差（需要手动同步模板）

---

### 2. Tailwind CSS v4 集成问题

**Shadow DOM 的样式隔离**:
```html
<theme-toggle>
  #shadow-root
    <button class="px-4 py-2 bg-blue-500">切换主题</button>
    <!-- Tailwind 样式无法穿透 Shadow DOM -->
</theme-toggle>
```

**解决方案的问题**:

#### 方案 A: 在 Shadow DOM 中注入 Tailwind
```javascript
class ThemeToggle extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    // 需要注入完整的 Tailwind CSS
    this.shadowRoot.innerHTML = `
      <style>@import '/styles/tailwind.css';</style>
      <button class="px-4 py-2 bg-blue-500">切换主题</button>
    `;
  }
}
```

**问题**:
- ❌ 每个组件都加载完整 Tailwind（性能问题）
- ❌ 样式重复加载（浪费带宽）
- ❌ CSS 变量无法共享（主题不一致）

#### 方案 B: 使用 CSS 变量 + 构造样式表
```javascript
class ThemeToggle extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`
      button { padding: var(--spacing-4); background: var(--color-blue-500); }
    `);
    this.shadowRoot.adoptedStyleSheets = [sheet];
  }
}
```

**问题**:
- ⚠️ 失去 Tailwind 的便利性（需要手动映射）
- ⚠️ 开发体验差（不能直接用 Tailwind 类）
- ⚠️ 维护成本高（需要同步 Tailwind 配置）

---

### 3. 初始化时机问题

**Web Components 的生命周期**:
```html
<!-- 1. HTML 解析 -->
<theme-toggle></theme-toggle>

<!-- 2. 等待 JS 加载 -->
<script type="module" src="/js/theme-toggle.js"></script>

<!-- 3. 等待 customElements.define -->
<script>
  customElements.define('theme-toggle', ThemeToggle);
</script>

<!-- 4. 组件初始化 -->
<!-- 用户才能看到内容 -->
```

**问题**:
- ❌ 首屏渲染延迟（等待 JS）
- ❌ 闪烁问题（内容突然出现）
- ❌ 性能指标差（LCP、FCP）

**混合架构的优势**:
```html
<!-- 1. HTML 解析（内容立即可见） -->
<button data-ui-component="theme-toggle">切换主题</button>

<!-- 2. JS 加载后增强功能 -->
<script type="module">
  import { ThemeManager } from '@ouraihub/core/theme';
  new ThemeManager(document.querySelector('[data-ui-component="theme-toggle"]'));
</script>
```

**优势**:
- ✅ 内容立即可见（SEO 友好）
- ✅ 渐进增强（JS 失败也能看到内容）
- ✅ 性能指标好（LCP、FCP）

---

### 4. 开发体验对比

| 方面 | Web Components | 混合架构 |
|------|---------------|---------|
| **框架语法** | 需要学习 Web Components API | 使用框架原生语法 |
| **Tailwind 集成** | 复杂（Shadow DOM 隔离） | 无缝集成 |
| **调试** | 需要理解 Shadow DOM | 标准 DOM 调试 |
| **IDE 支持** | 有限（自定义元素） | 完整支持 |
| **类型安全** | 需要手动定义 | TypeScript 原生支持 |
| **SSG 集成** | 需要特殊处理 | 原生支持 |

---

## 后果

### 正面影响

1. **SEO 友好**: 内容在初始 HTML 中，搜索引擎直接可见
2. **性能优秀**: 首屏渲染不依赖 JS
3. **Tailwind 无缝集成**: 直接使用 Tailwind 类
4. **开发体验好**: 使用框架原生语法
5. **浏览器兼容性好**: 不依赖新特性

### 负面影响

1. **复用率略低**: 95% vs 100%（但差距很小）
2. **需要薄包装层**: 每个框架需要维护一套（但代码量很小）

### 风险缓解

- **代码生成**: 使用工具自动生成薄包装层
- **文档**: 提供清晰的包装层开发指南
- **示例**: 提供完整的示例代码

---

## 替代方案

### 方案 A: 使用 Web Components（已拒绝）

**优点**:
- ✅ 100% 代码复用
- ✅ 真正的跨框架
- ✅ 标准化

**缺点**:
- ❌ SSG 场景 SEO 不友好
- ❌ Tailwind v4 集成复杂
- ❌ 初始化时机问题
- ❌ 开发体验较差

**为什么没选**: 在 SSG + Tailwind v4 场景下，缺点大于优点。

---

### 方案 B: Web Components + Declarative Shadow DOM

**优点**:
- ✅ 解决 SEO 问题
- ✅ 100% 代码复用

**缺点**:
- ❌ 浏览器支持有限
- ❌ SSG 工具支持不足（Hugo 不支持）
- ❌ Tailwind 集成仍然复杂
- ❌ 开发体验差（手动同步模板）

**为什么没选**: 技术成熟度不足，工具链支持不够。

---

### 方案 C: 混合架构（已选择）

**优点**:
- ✅ 95% 代码复用
- ✅ SEO 友好
- ✅ Tailwind 无缝集成
- ✅ 开发体验好
- ✅ 性能优秀

**缺点**:
- ⚠️ 需要维护薄包装层（但代码量很小）

**为什么选择**: 在当前技术栈和场景下，这是最佳平衡方案。

---

## 未来重新评估的条件

如果以下条件满足，可以重新考虑 Web Components：

1. **Declarative Shadow DOM** 成为主流（所有浏览器 + SSG 工具支持）
2. **Tailwind CSS** 提供官方的 Shadow DOM 集成方案
3. **搜索引擎** 完全支持 Shadow DOM 内容索引
4. **性能** 不再是首要考虑（或有更好的解决方案）

**评估周期**: 每年一次（2027-05-12）

---

## 相关决策

- [ADR-001: 混合架构](./001-hybrid-architecture.md) - 为什么选择混合架构
- [ADR-003: CSS 变量 vs CSS-in-JS](./003-css-variables-over-css-in-js.md) - 样式方案选择

---

## 参考资料

- [Pagefind 架构研究](../architecture/01-pagefind-study.md) - Pagefind 也没用 Web Components
- [完整设计方案](../DESIGN.md)
- [Web Components Best Practices](https://web.dev/custom-elements-best-practices/)
- [Declarative Shadow DOM](https://web.dev/declarative-shadow-dom/)
- Oracle 的技术评估（2026-05-12）

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-12
