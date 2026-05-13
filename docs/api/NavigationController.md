# NavigationController API

> **包**: `@ouraihub/core`  
> **版本**: 1.4.0  
> **最后更新**: 2026-05-13

导航菜单控制器，提供移动端菜单切换、多级下拉菜单、滚动时隐藏/显示导航栏、响应式断点自动切换等功能。

---

## 导入

```typescript
import { NavigationController } from '@ouraihub/core/navigation';
```

---

## 构造函数

```typescript
constructor(element: HTMLElement, options?: NavigationOptions)
```

创建 NavigationController 实例。

### 参数

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `element` | `HTMLElement` | 是 | - | 导航栏 DOM 元素 |
| `options` | `NavigationOptions` | 否 | `{}` | 配置选项 |

### NavigationOptions

| 属性 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `mobileBreakpoint` | `number` | 否 | `768` | 移动端断点（px） |
| `hideOnScroll` | `boolean` | 否 | `false` | 滚动时是否隐藏导航栏 |
| `scrollThreshold` | `number` | 否 | `100` | 触发隐藏的滚动距离（px） |
| `mobileMenuClass` | `string` | 否 | `'mobile-menu-open'` | 移动端菜单打开时的 CSS 类名 |
| `dropdownActiveClass` | `string` | 否 | `'dropdown-active'` | 下拉菜单激活时的 CSS 类名 |
| `hiddenClass` | `string` | 否 | `'nav-hidden'` | 导航栏隐藏时的 CSS 类名 |
| `bodyLockClass` | `string` | 否 | `'scroll-lock'` | body 滚动锁定时的 CSS 类名 |

### 示例

```typescript
// 使用默认配置
const nav = new NavigationController(document.querySelector('nav'));

// 自定义配置
const nav = new NavigationController(document.querySelector('nav'), {
  mobileBreakpoint: 1024,
  hideOnScroll: true,
  scrollThreshold: 150,
  mobileMenuClass: 'menu-active',
  dropdownActiveClass: 'open',
  hiddenClass: 'hidden',
  bodyLockClass: 'no-scroll'
});
```

---

## 方法

### openMobileMenu()

```typescript
openMobileMenu(): void
```

打开移动端菜单，锁定 body 滚动。

#### 示例

```typescript
nav.openMobileMenu();
```

---

### closeMobileMenu()

```typescript
closeMobileMenu(): void
```

关闭移动端菜单，解锁 body 滚动，同时关闭所有下拉菜单。

#### 示例

```typescript
nav.closeMobileMenu();
```

---

### toggleMobileMenu()

```typescript
toggleMobileMenu(): void
```

切换移动端菜单状态（打开/关闭）。

#### 示例

```typescript
// 绑定到汉堡菜单按钮
document.querySelector('[data-menu-toggle]')?.addEventListener('click', () => {
  nav.toggleMobileMenu();
});
```

---

### openDropdown()

```typescript
openDropdown(dropdownId: string): void
```

打开指定下拉菜单，自动关闭其他已打开的下拉菜单。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `dropdownId` | `string` | 是 | 下拉菜单 ID（对应 `data-dropdown` 属性） |

#### 示例

```typescript
nav.openDropdown('products-menu');
```

---

### closeDropdown()

```typescript
closeDropdown(): void
```

关闭当前打开的下拉菜单。

#### 示例

```typescript
nav.closeDropdown();
```

---

### toggleDropdown()

```typescript
toggleDropdown(dropdownId: string): void
```

切换指定下拉菜单状态（打开/关闭）。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `dropdownId` | `string` | 是 | 下拉菜单 ID（对应 `data-dropdown` 属性） |

#### 示例

```typescript
// 绑定到下拉菜单触发器
document.querySelector('[data-dropdown-trigger="products"]')?.addEventListener('click', () => {
  nav.toggleDropdown('products-menu');
});
```

---

### getState()

```typescript
getState(): Readonly<NavigationState>
```

获取当前导航状态的只读副本。

#### 返回值

| 类型 | 描述 |
|------|------|
| `Readonly<NavigationState>` | 当前导航状态 |

#### NavigationState

```typescript
interface NavigationState {
  isMobileMenuOpen: boolean;      // 移动端菜单是否打开
  activeDropdown: string | null;  // 当前激活的下拉菜单 ID
  isHidden: boolean;              // 导航栏是否隐藏
  isMobile: boolean;              // 是否处于移动端模式
  lastScrollY: number;            // 上次滚动位置
  scrollDirection: ScrollDirection; // 滚动方向
}

type ScrollDirection = 'up' | 'down' | 'none';
```

#### 示例

```typescript
const state = nav.getState();
console.log('移动端菜单:', state.isMobileMenuOpen ? '打开' : '关闭');
console.log('当前模式:', state.isMobile ? '移动端' : '桌面端');
console.log('导航栏:', state.isHidden ? '隐藏' : '显示');
```

---

### onMenuToggle()

```typescript
onMenuToggle(callback: (isOpen: boolean) => void): () => void
```

监听移动端菜单切换事件。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `callback` | `(isOpen: boolean) => void` | 是 | 菜单状态变化时的回调函数 |

#### 返回值

| 类型 | 描述 |
|------|------|
| `() => void` | 取消订阅函数 |

#### 示例

```typescript
const unsubscribe = nav.onMenuToggle((isOpen) => {
  console.log('移动端菜单:', isOpen ? '打开' : '关闭');
  
  // 更新汉堡菜单图标
  const icon = document.querySelector('[data-menu-icon]');
  if (icon) {
    icon.textContent = isOpen ? '✕' : '☰';
  }
});

// 取消监听
unsubscribe();
```

---

### onDropdownToggle()

```typescript
onDropdownToggle(callback: (dropdownId: string | null) => void): () => void
```

监听下拉菜单切换事件。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `callback` | `(dropdownId: string \| null) => void` | 是 | 下拉菜单状态变化时的回调函数 |

#### 返回值

| 类型 | 描述 |
|------|------|
| `() => void` | 取消订阅函数 |

#### 示例

```typescript
const unsubscribe = nav.onDropdownToggle((dropdownId) => {
  if (dropdownId) {
    console.log(`下拉菜单 ${dropdownId} 已打开`);
  } else {
    console.log('所有下拉菜单已关闭');
  }
});

// 取消监听
unsubscribe();
```

---

### onScroll()

```typescript
onScroll(callback: (state: { isHidden: boolean; direction: ScrollDirection }) => void): () => void
```

监听滚动事件（仅在 `hideOnScroll` 为 `true` 时触发）。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `callback` | `(state: { isHidden: boolean; direction: ScrollDirection }) => void` | 是 | 滚动状态变化时的回调函数 |

#### 返回值

| 类型 | 描述 |
|------|------|
| `() => void` | 取消订阅函数 |

#### 示例

```typescript
const unsubscribe = nav.onScroll(({ isHidden, direction }) => {
  console.log(`导航栏: ${isHidden ? '隐藏' : '显示'}, 滚动方向: ${direction}`);
  
  // 根据滚动方向添加动画类
  const nav = document.querySelector('nav');
  if (direction === 'down') {
    nav?.classList.add('scrolling-down');
  } else if (direction === 'up') {
    nav?.classList.add('scrolling-up');
  }
});

// 取消监听
unsubscribe();
```

---

### destroy()

```typescript
destroy(): void
```

销毁实例，清理所有事件监听器，关闭菜单和下拉菜单。

#### 示例

```typescript
nav.destroy();
```

---

## 内部机制

### 移动端检测

NavigationController 使用 `window.innerWidth` 检测当前是否处于移动端模式：

```typescript
isMobile = window.innerWidth < mobileBreakpoint
```

当窗口大小变化时，自动重新检测并更新状态。如果从移动端切换到桌面端，自动关闭移动端菜单。

### 滚动锁定

移动端菜单打开时，自动锁定 body 滚动：

```typescript
// 锁定
document.body.classList.add('scroll-lock');
document.body.style.overflow = 'hidden';

// 解锁
document.body.classList.remove('scroll-lock');
document.body.style.overflow = '';
```

### 点击外部关闭

下拉菜单打开时，点击菜单外部区域会自动关闭下拉菜单。使用事件委托监听 `document` 的点击事件。

### 滚动隐藏

当 `hideOnScroll` 为 `true` 时：

1. 监听 `window.scroll` 事件（使用 `passive: true` 优化性能）
2. 计算滚动方向（向上/向下）
3. 当向下滚动且超过 `scrollThreshold` 时，添加 `hiddenClass`
4. 当向上滚动时，移除 `hiddenClass`
5. 忽略小于 5px 的滚动变化（防止抖动）

---

## 完整示例

### 基础用法

```typescript
import { NavigationController } from '@ouraihub/core/navigation';

// 创建实例
const nav = new NavigationController(document.querySelector('nav'), {
  mobileBreakpoint: 768,
  hideOnScroll: true,
  scrollThreshold: 100
});

// 绑定汉堡菜单按钮
document.querySelector('[data-menu-toggle]')?.addEventListener('click', () => {
  nav.toggleMobileMenu();
});

// 绑定下拉菜单触发器
document.querySelectorAll('[data-dropdown-trigger]').forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    const dropdownId = trigger.getAttribute('data-dropdown-trigger');
    if (dropdownId) {
      nav.toggleDropdown(dropdownId);
    }
  });
});

// 监听菜单状态变化
nav.onMenuToggle((isOpen) => {
  const icon = document.querySelector('[data-menu-icon]');
  if (icon) {
    icon.textContent = isOpen ? '✕' : '☰';
  }
});
```

### 高级用法：完整导航系统

```typescript
import { NavigationController } from '@ouraihub/core/navigation';

// 创建实例
const nav = new NavigationController(document.querySelector('nav'), {
  mobileBreakpoint: 1024,
  hideOnScroll: true,
  scrollThreshold: 150,
  mobileMenuClass: 'menu-active',
  dropdownActiveClass: 'open'
});

// 汉堡菜单按钮
const menuToggle = document.querySelector('[data-menu-toggle]');
menuToggle?.addEventListener('click', () => {
  nav.toggleMobileMenu();
});

// 下拉菜单触发器
document.querySelectorAll('[data-dropdown-trigger]').forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    const dropdownId = trigger.getAttribute('data-dropdown-trigger');
    if (dropdownId) {
      nav.toggleDropdown(dropdownId);
    }
  });
});

// 监听移动端菜单状态
nav.onMenuToggle((isOpen) => {
  // 更新按钮图标
  const icon = menuToggle?.querySelector('[data-menu-icon]');
  if (icon) {
    icon.textContent = isOpen ? '✕' : '☰';
  }
  
  // 更新 ARIA 属性
  menuToggle?.setAttribute('aria-expanded', String(isOpen));
  
  // 记录日志
  console.log(`移动端菜单: ${isOpen ? '打开' : '关闭'}`);
});

// 监听下拉菜单状态
nav.onDropdownToggle((dropdownId) => {
  // 更新所有触发器的 ARIA 属性
  document.querySelectorAll('[data-dropdown-trigger]').forEach(trigger => {
    const id = trigger.getAttribute('data-dropdown-trigger');
    const isActive = id === dropdownId;
    trigger.setAttribute('aria-expanded', String(isActive));
  });
});

// 监听滚动状态
nav.onScroll(({ isHidden, direction }) => {
  const navElement = document.querySelector('nav');
  
  // 添加滚动方向类
  navElement?.classList.toggle('scrolling-down', direction === 'down');
  navElement?.classList.toggle('scrolling-up', direction === 'up');
  
  // 记录日志
  console.log(`导航栏: ${isHidden ? '隐藏' : '显示'}, 方向: ${direction}`);
});

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  nav.destroy();
});
```

### HTML 结构示例

```html
<!-- 导航栏 -->
<nav class="navbar">
  <!-- 汉堡菜单按钮 -->
  <button data-menu-toggle aria-label="切换菜单" aria-expanded="false">
    <span data-menu-icon>☰</span>
  </button>
  
  <!-- 导航菜单 -->
  <ul class="nav-menu">
    <li><a href="/">首页</a></li>
    
    <!-- 下拉菜单 -->
    <li data-dropdown="products-menu">
      <button data-dropdown-trigger="products-menu" aria-expanded="false">
        产品
        <span class="dropdown-icon">▼</span>
      </button>
      <ul class="dropdown-content">
        <li><a href="/products/a">产品 A</a></li>
        <li><a href="/products/b">产品 B</a></li>
        <li><a href="/products/c">产品 C</a></li>
      </ul>
    </li>
    
    <li><a href="/about">关于</a></li>
    <li><a href="/contact">联系</a></li>
  </ul>
</nav>
```

---

## CSS 集成

### 基础样式

```css
/* 导航栏 */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  transition: transform 0.3s ease;
}

/* 滚动隐藏 */
.navbar.nav-hidden {
  transform: translateY(-100%);
}

/* 移动端菜单 */
@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .navbar.mobile-menu-open .nav-menu {
    display: block;
  }
}

/* 下拉菜单 */
.dropdown-content {
  display: none;
}

[data-dropdown].dropdown-active .dropdown-content {
  display: block;
}

/* 滚动锁定 */
body.scroll-lock {
  overflow: hidden;
}
```

### 使用 Tailwind CSS

```html
<nav class="fixed top-0 w-full transition-transform duration-300 
            data-[hidden]:translate-y-[-100%]">
  <button data-menu-toggle 
          class="lg:hidden"
          aria-label="切换菜单">
    <span data-menu-icon>☰</span>
  </button>
  
  <ul class="hidden lg:flex 
             data-[mobile-open]:flex">
    <li><a href="/">首页</a></li>
    <li data-dropdown="products" 
        class="relative">
      <button data-dropdown-trigger="products">
        产品
      </button>
      <ul class="hidden 
                 data-[active]:block 
                 absolute top-full left-0">
        <li><a href="/products/a">产品 A</a></li>
        <li><a href="/products/b">产品 B</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

---

## 注意事项

### 浏览器兼容性

- **ResizeObserver**: Chrome 64+, Firefox 69+, Safari 13.1+
- **Passive Event Listeners**: Chrome 51+, Firefox 49+, Safari 10+
- **classList**: IE 10+，所有现代浏览器

对于不支持的浏览器，NavigationController 会优雅降级。

### 性能考虑

- 滚动事件使用 `passive: true` 优化性能
- 忽略小于 5px 的滚动变化，减少不必要的 DOM 操作
- 使用事件委托处理点击外部关闭
- 自动清理事件监听器，防止内存泄漏

### 最佳实践

1. **单例模式**: 每个导航栏只创建一个 NavigationController 实例
2. **清理资源**: 页面卸载时调用 `destroy()` 方法
3. **ARIA 属性**: 更新菜单状态时同步更新 ARIA 属性
4. **键盘导航**: 配合键盘事件实现完整的可访问性
5. **CSS 过渡**: 使用 CSS 过渡动画提升用户体验

```typescript
// ✅ 好的做法
const nav = new NavigationController(document.querySelector('nav'));

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  nav.destroy();
});

// ❌ 不好的做法
// 多次创建实例
const nav1 = new NavigationController(document.querySelector('nav'));
const nav2 = new NavigationController(document.querySelector('nav')); // 不必要

// 忘记清理
nav.onMenuToggle(callback); // 可能导致内存泄漏
```

---

## 相关文档

- [API 参考索引](./README.md)
- [LazyLoader API](./LazyLoader.md)
- [SearchModal API](./SearchModal.md)
- [类型定义](./types.md)
- [完整设计方案](../DESIGN.md)

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-13
