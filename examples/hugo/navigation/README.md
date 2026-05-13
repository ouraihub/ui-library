# 导航菜单示例

完整的响应式导航菜单实现，支持移动端菜单、多级下拉菜单、滚动隐藏等功能。

## 功能特性

- ✅ 移动端汉堡菜单
- ✅ 多级下拉菜单
- ✅ 滚动时自动隐藏
- ✅ 点击外部关闭
- ✅ 响应式断点切换
- ✅ 滚动锁定

## 文件结构

```
navigation/
├── README.md           # 本文件
├── index.html          # 完整示例页面
├── navigation.js       # JavaScript 实现
└── navigation.css      # 样式文件
```

## 快速开始

### 1. HTML 结构

```html
<!-- 导航栏 -->
<nav class="navbar">
  <!-- Logo -->
  <a href="/" class="navbar__logo">
    <span>Logo</span>
  </a>
  
  <!-- 汉堡菜单按钮 -->
  <button class="navbar__toggle" 
          data-menu-toggle 
          aria-label="切换菜单"
          aria-expanded="false">
    <span class="navbar__toggle-icon" data-menu-icon>☰</span>
  </button>
  
  <!-- 导航菜单 -->
  <ul class="navbar__menu">
    <li><a href="/">首页</a></li>
    
    <!-- 下拉菜单 -->
    <li class="navbar__item--dropdown" data-dropdown="products">
      <button class="navbar__dropdown-trigger" 
              data-dropdown-trigger="products"
              aria-expanded="false">
        产品
        <span class="navbar__dropdown-icon">▼</span>
      </button>
      <ul class="navbar__dropdown">
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

### 2. JavaScript 初始化

```javascript
import { NavigationController } from '@ouraihub/core/navigation';

// 创建导航控制器
const nav = new NavigationController(document.querySelector('.navbar'), {
  mobileBreakpoint: 768,
  hideOnScroll: true,
  scrollThreshold: 100,
  mobileMenuClass: 'navbar--mobile-open',
  dropdownActiveClass: 'navbar__item--active',
  hiddenClass: 'navbar--hidden',
  bodyLockClass: 'scroll-lock'
});

// 绑定汉堡菜单按钮
document.querySelector('[data-menu-toggle]')?.addEventListener('click', () => {
  nav.toggleMobileMenu();
});

// 绑定下拉菜单触发器
document.querySelectorAll('[data-dropdown-trigger]').forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    const dropdownId = trigger.getAttribute('data-dropdown-trigger');
    if (dropdownId) {
      nav.toggleDropdown(dropdownId);
    }
  });
});

// 监听菜单状态
nav.onMenuToggle((isOpen) => {
  const icon = document.querySelector('[data-menu-icon]');
  const toggle = document.querySelector('[data-menu-toggle]');
  
  if (icon) {
    icon.textContent = isOpen ? '✕' : '☰';
  }
  
  if (toggle) {
    toggle.setAttribute('aria-expanded', String(isOpen));
  }
});

// 监听下拉菜单状态
nav.onDropdownToggle((dropdownId) => {
  document.querySelectorAll('[data-dropdown-trigger]').forEach(trigger => {
    const id = trigger.getAttribute('data-dropdown-trigger');
    const isActive = id === dropdownId;
    trigger.setAttribute('aria-expanded', String(isActive));
  });
});
```

### 3. CSS 样式

```css
/* 导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: transform 0.3s ease;
}

/* 滚动隐藏 */
.navbar--hidden {
  transform: translateY(-100%);
}

/* Logo */
.navbar__logo {
  padding: 1rem;
  font-weight: bold;
  text-decoration: none;
  color: inherit;
}

/* 汉堡菜单按钮 */
.navbar__toggle {
  display: none;
  padding: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
}

/* 导航菜单 */
.navbar__menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.navbar__menu > li {
  position: relative;
}

.navbar__menu > li > a,
.navbar__dropdown-trigger {
  display: block;
  padding: 1rem;
  text-decoration: none;
  color: inherit;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

/* 下拉菜单 */
.navbar__dropdown {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  list-style: none;
  margin: 0;
  padding: 0;
  min-width: 200px;
}

.navbar__item--active .navbar__dropdown {
  display: block;
}

.navbar__dropdown li a {
  display: block;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: inherit;
  white-space: nowrap;
}

.navbar__dropdown li a:hover {
  background: #f5f5f5;
}

/* 移动端样式 */
@media (max-width: 768px) {
  .navbar__toggle {
    display: block;
  }
  
  .navbar__menu {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .navbar--mobile-open .navbar__menu {
    display: flex;
  }
  
  .navbar__dropdown {
    position: static;
    box-shadow: none;
    background: #f5f5f5;
  }
}

/* 滚动锁定 */
body.scroll-lock {
  overflow: hidden;
}
```

## 运行示例

1. 在浏览器中打开 `index.html`
2. 调整窗口大小查看响应式效果
3. 点击汉堡菜单按钮切换移动端菜单
4. 点击"产品"查看下拉菜单
5. 向下滚动查看导航栏隐藏效果

## 自定义配置

### 修改断点

```javascript
const nav = new NavigationController(document.querySelector('.navbar'), {
  mobileBreakpoint: 1024, // 改为 1024px
});
```

### 禁用滚动隐藏

```javascript
const nav = new NavigationController(document.querySelector('.navbar'), {
  hideOnScroll: false,
});
```

### 自定义 CSS 类名

```javascript
const nav = new NavigationController(document.querySelector('.navbar'), {
  mobileMenuClass: 'menu-active',
  dropdownActiveClass: 'dropdown-open',
  hiddenClass: 'hidden',
  bodyLockClass: 'no-scroll'
});
```

## 常见问题

### Q: 如何添加更多下拉菜单？

A: 复制下拉菜单的 HTML 结构，修改 `data-dropdown` 和 `data-dropdown-trigger` 的值即可：

```html
<li class="navbar__item--dropdown" data-dropdown="services">
  <button data-dropdown-trigger="services">服务</button>
  <ul class="navbar__dropdown">
    <li><a href="/service-1">服务 1</a></li>
    <li><a href="/service-2">服务 2</a></li>
  </ul>
</li>
```

### Q: 如何实现多级下拉菜单？

A: 在下拉菜单项中嵌套另一个下拉菜单结构，并添加相应的 CSS 样式。

### Q: 移动端菜单如何添加动画？

A: 在 CSS 中为 `.navbar__menu` 添加过渡动画：

```css
.navbar__menu {
  transition: transform 0.3s ease;
  transform: translateX(-100%);
}

.navbar--mobile-open .navbar__menu {
  transform: translateX(0);
}
```

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 相关文档

- [NavigationController API](../../../docs/api/NavigationController.md)
- [完整设计方案](../../../docs/DESIGN.md)
