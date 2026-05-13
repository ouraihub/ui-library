import { NavigationController } from '@ouraihub/core/navigation';

const nav = new NavigationController(document.querySelector('.navbar'), {
  mobileBreakpoint: 768,
  hideOnScroll: true,
  scrollThreshold: 100,
  mobileMenuClass: 'navbar--mobile-open',
  dropdownActiveClass: 'navbar__item--active',
  hiddenClass: 'navbar--hidden',
  bodyLockClass: 'scroll-lock'
});

document.querySelector('[data-menu-toggle]')?.addEventListener('click', () => {
  nav.toggleMobileMenu();
});

document.querySelectorAll('[data-dropdown-trigger]').forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    const dropdownId = trigger.getAttribute('data-dropdown-trigger');
    if (dropdownId) {
      nav.toggleDropdown(dropdownId);
    }
  });
});

nav.onMenuToggle((isOpen) => {
  const icon = document.querySelector('[data-menu-icon]');
  const toggle = document.querySelector('[data-menu-toggle]');
  
  if (icon) {
    icon.textContent = isOpen ? '✕' : '☰';
  }
  
  if (toggle) {
    toggle.setAttribute('aria-expanded', String(isOpen));
  }
  
  console.log('移动端菜单:', isOpen ? '打开' : '关闭');
});

nav.onDropdownToggle((dropdownId) => {
  document.querySelectorAll('[data-dropdown-trigger]').forEach(trigger => {
    const id = trigger.getAttribute('data-dropdown-trigger');
    const isActive = id === dropdownId;
    trigger.setAttribute('aria-expanded', String(isActive));
  });
  
  if (dropdownId) {
    console.log(`下拉菜单 ${dropdownId} 已打开`);
  } else {
    console.log('所有下拉菜单已关闭');
  }
});

nav.onScroll(({ isHidden, direction }) => {
  console.log(`导航栏: ${isHidden ? '隐藏' : '显示'}, 滚动方向: ${direction}`);
});

window.addEventListener('beforeunload', () => {
  nav.destroy();
});
