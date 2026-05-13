import { ThemeManager } from '@ouraihub/ui-library';

const themeManager = new ThemeManager();

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const btn = target.closest('[data-ui-component="theme-toggle"]');
  
  if (btn) {
    e.preventDefault();
    themeManager.toggle();
    
    document.querySelectorAll('[data-ui-component="theme-toggle"]').forEach(button => {
      button.classList.add('theme-toggle-active');
      setTimeout(() => {
        button.classList.remove('theme-toggle-active');
      }, 300);
    });
  }
});

export { themeManager };
