import { ThemeManager } from './ThemeManager';

function initThemeToggles() {
  const toggles = document.querySelectorAll('[data-ui-component="theme-toggle"]');
  
  toggles.forEach((element) => {
    const storageKey = element.getAttribute('data-ui-storage-key') || 'theme';
    const attribute = element.getAttribute('data-ui-attribute') || 'data-theme';
    
    const manager = new ThemeManager(document.documentElement, {
      storageKey,
      attribute,
    });
    
    element.addEventListener('click', () => {
      manager.toggle();
    });
    
    manager.onThemeChange((theme) => {
      console.log('[ThemeManager] Theme changed:', theme);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThemeToggles);
} else {
  initThemeToggles();
}
