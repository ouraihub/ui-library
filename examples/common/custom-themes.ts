/**
 * 自定义主题示例
 * 
 * 展示如何扩展主题系统，支持多个自定义主题
 */

import { ThemeManager } from '@ouraihub/ui-library';

type CustomTheme = 'light' | 'dark' | 'blue' | 'green' | 'system';

class CustomThemeManager extends ThemeManager {
  private customTheme: CustomTheme = 'system';
  
  setCustomTheme(theme: CustomTheme): void {
    this.customTheme = theme;
    
    if (theme === 'blue' || theme === 'green') {
      document.documentElement.setAttribute('data-custom-theme', theme);
      this.setTheme('light');
    } else {
      document.documentElement.removeAttribute('data-custom-theme');
      this.setTheme(theme);
    }
  }
  
  getCustomTheme(): CustomTheme {
    return this.customTheme;
  }
}

const customThemeManager = new CustomThemeManager();

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const themeBtn = target.closest('[data-custom-theme-value]');
  
  if (themeBtn) {
    const theme = themeBtn.getAttribute('data-custom-theme-value') as CustomTheme;
    customThemeManager.setCustomTheme(theme);
  }
});

export { customThemeManager };
