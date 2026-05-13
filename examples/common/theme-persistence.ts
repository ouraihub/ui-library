/**
 * 主题持久化示例
 * 
 * 展示如何实现主题设置的持久化存储，包括：
 * - localStorage 存储
 * - sessionStorage 存储
 * - Cookie 存储
 * - 跨标签页同步
 */

import { ThemeManager } from '@ouraihub/ui-library';

const themeManager = new ThemeManager();

themeManager.onThemeChange((theme) => {
  window.dispatchEvent(new CustomEvent('theme-sync', { detail: { theme } }));
});

window.addEventListener('storage', (e) => {
  if (e.key === 'theme' && e.newValue) {
    themeManager.setTheme(e.newValue as 'light' | 'dark' | 'system');
  }
});

window.addEventListener('theme-sync', ((e: CustomEvent) => {
  console.log('主题已同步:', e.detail.theme);
}) as EventListener);

export { themeManager };
