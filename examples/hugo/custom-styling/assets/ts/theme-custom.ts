import { ThemeManager } from '@ouraihub/ui-library';

const themeManager = new ThemeManager();

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const btn = target.closest('[data-ui-component="theme-toggle"]');
  
  if (btn) {
    e.preventDefault();
    themeManager.toggle();
  }
});

export { themeManager };
