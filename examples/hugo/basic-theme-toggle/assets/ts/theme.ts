/**
 * 基础主题切换示例
 * 
 * 功能:
 * - Light/Dark 双主题切换
 * - localStorage 持久化
 * - 系统主题同步
 * - 防闪烁机制
 */

import { ThemeManager } from '@ouraihub/ui-library';

/**
 * 初始化主题管理器
 * 
 * ThemeManager 会自动:
 * 1. 从 localStorage 加载保存的主题
 * 2. 监听系统主题变化
 * 3. 应用主题到 document.documentElement
 */
const themeManager = new ThemeManager();

/**
 * 监听主题切换按钮点击
 * 
 * 使用事件委托，确保动态添加的按钮也能工作
 */
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  
  // 查找最近的主题切换按钮
  const toggleBtn = target.closest('[data-ui-component="theme-toggle"]');
  
  if (toggleBtn) {
    e.preventDefault();
    
    // 切换主题（light <-> dark）
    themeManager.toggle();
    
    // 可选: 添加切换动画
    toggleBtn.classList.add('theme-toggle-active');
    setTimeout(() => {
      toggleBtn.classList.remove('theme-toggle-active');
    }, 300);
  }
});

/**
 * 监听主题变化（可选）
 * 
 * 当主题改变时执行自定义逻辑
 */
themeManager.onThemeChange((theme) => {
  console.log('主题已切换:', theme);
  
  // 示例: 更新其他 UI 元素
  // updateOtherUIElements(theme);
});

/**
 * 导出主题管理器实例（可选）
 * 
 * 允许其他模块访问主题管理器
 */
export { themeManager };

/**
 * 示例: 手动设置主题
 * 
 * 如果需要通过其他方式（如下拉菜单）设置主题:
 */
// themeManager.setTheme('dark');   // 设置为暗色主题
// themeManager.setTheme('light');  // 设置为亮色主题
// themeManager.setTheme('system'); // 跟随系统主题

/**
 * 示例: 获取当前主题
 */
// const currentTheme = themeManager.getTheme();
// console.log('当前主题:', currentTheme); // 'light' | 'dark' | 'system'
