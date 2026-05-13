# ADR-003: 使用 CSS 变量而非 CSS-in-JS

**状态**: 已接受  
**日期**: 2026-05-12  
**决策者**: Sisyphus (AI Agent)

---

## 背景

在设计组件库的样式系统时，我们需要选择样式方案：

**选项**:
1. CSS 变量（CSS Custom Properties）
2. CSS-in-JS（styled-components、emotion 等）
3. Tailwind CSS 工具类
4. 传统 CSS/SCSS

**需求**:
- 主题化支持（light/dark 模式）
- 跨框架复用（Hugo + Astro）
- 与 Tailwind CSS v4 集成
- 性能优秀（SSG 场景）
- 开发体验好

---

## 决策

我们决定使用 **CSS 变量 + Tailwind CSS** 的组合方案：

```css
/* CSS 变量定义主题令牌 */
:root {
  --ui-text: #1a1a1a;
  --ui-background: #ffffff;
  --ui-primary: #2937f0;
}

[data-theme="dark"] {
  --ui-text: #e5e5e5;
  --ui-background: #1a1a1a;
  --ui-primary: #4f5ff5;
}
```

```html
<!-- Tailwind 工具类使用 CSS 变量 -->
<button class="bg-[var(--ui-primary)] text-[var(--ui-text)]">
  按钮
</button>
```

---

## 理由

### 1. 跨框架兼容性

**CSS 变量的优势**:
```css
/* 一次定义，到处使用 */
:root {
  --ui-primary: #2937f0;
}
```

```html
<!-- Hugo -->
<button style="background: var(--ui-primary)">按钮</button>

<!-- Astro -->
<button style="background: var(--ui-primary)">按钮</button>

<!-- 原生 HTML -->
<button style="background: var(--ui-primary)">按钮</button>
```

**CSS-in-JS 的问题**:
```javascript
// 需要 React/Vue 等框架
import styled from 'styled-components';
const Button = styled.button`
  background: ${props => props.theme.primary};
`;
```

**问题**:
- ❌ 依赖特定框架（React、Vue）
- ❌ Hugo 不支持 JSX
- ❌ 运行时开销（生成样式）

---

### 2. SSG 场景性能

**CSS 变量的性能**:
```html
<!-- 构建时生成 -->
<style>
  :root { --ui-primary: #2937f0; }
</style>
<button class="bg-[var(--ui-primary)]">按钮</button>
```

**优势**:
- ✅ 零运行时开销（纯 CSS）
- ✅ 构建时优化（CSS 压缩）
- ✅ 浏览器原生支持（快速）

**CSS-in-JS 的性能问题**:
```javascript
// 运行时生成样式
const Button = styled.button`
  background: ${props => props.theme.primary};
`;
```

**问题**:
- ❌ 运行时开销（生成 CSS）
- ❌ 增加 JS 包体积
- ❌ 首屏渲染延迟（等待 JS）

---

### 3. Tailwind CSS v4 集成

**CSS 变量 + Tailwind 的完美结合**:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'ui-primary': 'var(--ui-primary)',
        'ui-text': 'var(--ui-text)',
      }
    }
  }
}
```

```html
<!-- 直接使用 Tailwind 类 -->
<button class="bg-ui-primary text-ui-text">按钮</button>

<!-- 或使用任意值 -->
<button class="bg-[var(--ui-primary)]">按钮</button>
```

**优势**:
- ✅ 无缝集成 Tailwind
- ✅ 保留 Tailwind 的便利性
- ✅ 主题切换只需改变 CSS 变量

**CSS-in-JS 的问题**:
- ❌ 与 Tailwind 冲突（两套样式系统）
- ❌ 失去 Tailwind 的便利性
- ❌ 维护成本高（需要同步）

---

### 4. 主题化支持

**CSS 变量的主题切换**:
```typescript
// 核心逻辑
class ThemeManager {
  setTheme(theme: 'light' | 'dark') {
    document.documentElement.dataset.theme = theme;
    // CSS 变量自动更新
  }
}
```

```css
/* 主题定义 */
:root {
  --ui-text: #1a1a1a;
}

[data-theme="dark"] {
  --ui-text: #e5e5e5;
}
```

**优势**:
- ✅ 声明式（CSS 自动处理）
- ✅ 性能好（浏览器原生）
- ✅ 简单（只需切换 data 属性）

**CSS-in-JS 的主题切换**:
```javascript
// 需要 Context + Provider
<ThemeProvider theme={darkTheme}>
  <App />
</ThemeProvider>
```

**问题**:
- ❌ 需要框架支持（React Context）
- ❌ 跨框架困难
- ❌ 运行时开销

---

### 5. 开发体验

**CSS 变量的开发体验**:
```css
/* 定义一次 */
:root {
  --ui-spacing-4: 1rem;
  --ui-primary: #2937f0;
}
```

```html
<!-- 到处使用 -->
<div class="p-[var(--ui-spacing-4)] bg-[var(--ui-primary)]">
  内容
</div>
```

**优势**:
- ✅ IDE 自动补全（CSS 变量）
- ✅ 浏览器 DevTools 实时调试
- ✅ 无需编译（原生支持）

**CSS-in-JS 的开发体验**:
```javascript
const Button = styled.button`
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.primary};
`;
```

**问题**:
- ⚠️ 需要编译（增加构建时间）
- ⚠️ 调试困难（生成的类名）
- ⚠️ IDE 支持有限（模板字符串）

---

### 6. 参考 Pagefind 的成功实践

**Pagefind 使用 CSS 变量**:
```css
:root {
  --pagefind-ui-primary: #034ad8;
  --pagefind-ui-text: #393939;
  --pagefind-ui-background: #ffffff;
  --pagefind-ui-border: #eeeeee;
}
```

**优势**:
- ✅ 用户可以轻松自定义主题
- ✅ 无需重新编译
- ✅ 性能优秀

**详细研究**: 参见 [Pagefind 架构研究](../architecture/01-pagefind-study.md#css-变量主题化)

---

## 后果

### 正面影响

1. **跨框架兼容**: CSS 变量在所有框架中都能用
2. **性能优秀**: 零运行时开销，浏览器原生支持
3. **Tailwind 集成**: 无缝集成，保留便利性
4. **主题化简单**: 声明式，易于维护
5. **开发体验好**: IDE 支持，DevTools 调试
6. **用户可定制**: 用户可以覆盖 CSS 变量

### 负面影响

1. **浏览器兼容性**: 需要现代浏览器（IE 不支持）
   - **缓解**: 我们的目标是现代浏览器（ES2020+）
2. **类型安全**: CSS 变量没有类型检查
   - **缓解**: 使用 TypeScript 定义主题类型

### 风险缓解

```typescript
// 定义主题类型
export interface Theme {
  colors: {
    primary: string;
    text: string;
    background: string;
  };
  spacing: {
    sm: string;
    md: string;
    lg: string;
  };
}

// 类型安全的主题管理
class ThemeManager {
  setTheme(theme: Theme) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--ui-${key}`, value);
    });
  }
}
```

---

## 替代方案

### 方案 A: CSS-in-JS（已拒绝）

**优点**:
- ✅ 类型安全（TypeScript 支持）
- ✅ 动态样式（JS 计算）
- ✅ 作用域隔离（自动生成类名）

**缺点**:
- ❌ 依赖特定框架
- ❌ 运行时开销
- ❌ 增加 JS 包体积
- ❌ 与 Tailwind 冲突
- ❌ SSG 场景不适合

**为什么没选**: 在 SSG + Tailwind 场景下，缺点大于优点。

---

### 方案 B: 纯 Tailwind 工具类（已拒绝）

**优点**:
- ✅ 开发体验好
- ✅ 性能优秀
- ✅ 无运行时开销

**缺点**:
- ❌ 主题化困难（需要 dark: 前缀）
- ❌ 动态主题不支持
- ❌ 自定义主题需要重新编译

**为什么没选**: 主题化需求无法满足。

---

### 方案 C: CSS 变量 + Tailwind（已选择）

**优点**:
- ✅ 跨框架兼容
- ✅ 性能优秀
- ✅ Tailwind 集成
- ✅ 主题化简单
- ✅ 用户可定制

**缺点**:
- ⚠️ 浏览器兼容性（现代浏览器）
- ⚠️ 类型安全需要额外处理

**为什么选择**: 在当前场景下，这是最佳平衡方案。

---

## 实施细节

### 1. CSS 变量命名规范

```css
/* 命名格式: --{namespace}-{category}-{name} */
:root {
  /* 颜色 */
  --ui-color-primary: #2937f0;
  --ui-color-text: #1a1a1a;
  --ui-color-background: #ffffff;
  
  /* 间距 */
  --ui-spacing-sm: 0.5rem;
  --ui-spacing-md: 1rem;
  --ui-spacing-lg: 1.5rem;
  
  /* 圆角 */
  --ui-radius-sm: 0.25rem;
  --ui-radius-md: 0.5rem;
  
  /* 阴影 */
  --ui-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
}
```

### 2. Tailwind 配置

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'ui-primary': 'var(--ui-color-primary)',
        'ui-text': 'var(--ui-color-text)',
        'ui-background': 'var(--ui-color-background)',
      },
      spacing: {
        'ui-sm': 'var(--ui-spacing-sm)',
        'ui-md': 'var(--ui-spacing-md)',
        'ui-lg': 'var(--ui-spacing-lg)',
      }
    }
  }
}
```

### 3. TypeScript 类型定义

```typescript
// types/theme.ts
export interface ThemeColors {
  primary: string;
  text: string;
  background: string;
  border: string;
}

export interface ThemeSpacing {
  sm: string;
  md: string;
  lg: string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
}
```

---

## 相关决策

- [ADR-001: 混合架构](./001-hybrid-architecture.md) - 整体架构设计
- [ADR-002: 不使用 Web Components](./002-no-web-components.md) - 为什么不用 Web Components

---

## 参考资料

- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Pagefind 架构研究](../architecture/01-pagefind-study.md)
- [Tailwind CSS v4 文档](https://tailwindcss.com/)
- [完整设计方案](../DESIGN.md)

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-12
