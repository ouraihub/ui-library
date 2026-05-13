/**
 * 系统主题同步示例
 * 
 * 展示如何监听和同步系统主题变化
 */

import { ThemeManager } from '@ouraihub/ui-library';

const themeManager = new ThemeManager(document.documentElement, {
  defaultTheme: 'system',
});

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

mediaQuery.addEventListener('change', (e) => {
  console.log('系统主题已变化:', e.matches ? 'dark' : 'light');
  
  if (themeManager.getTheme() === 'system') {
    console.log('自动同步系统主题');
  }
});

themeManager.onThemeChange((theme) => {
  if (theme === 'system') {
    const systemTheme = mediaQuery.matches ? 'dark' : 'light';
    console.log('当前系统主题:', systemTheme);
  }
});

export { themeManager };
