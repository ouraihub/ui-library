/**
 * ThemeManager - 主题切换管理器
 * 核心逻辑：light/dark/system 三态切换，localStorage 持久化
 */
class ThemeManager {
  constructor(element = document.documentElement, options = {}) {
    this.element = element;
    this.storageKey = options.storageKey || 'theme';
    this.attribute = options.attribute || 'data-theme';
    this.currentTheme = options.defaultTheme || 'system';
    this.mediaQuery = null;
    this.listeners = [];
    
    this.init();
  }

  init() {
    const saved = this.loadFromStorage();
    if (saved) {
      this.currentTheme = saved;
    }
    
    this.applyTheme();
    this.watchSystemTheme();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch (e) {
      console.warn('[ThemeManager] localStorage unavailable');
    }
    return null;
  }

  saveToStorage(theme) {
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch (e) {
      console.warn('[ThemeManager] Failed to save theme');
    }
  }

  watchSystemTheme() {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handler = () => {
      if (this.currentTheme === 'system') {
        this.applyTheme();
        this.notifyListeners();
      }
    };
    
    if (this.mediaQuery.addEventListener) {
      this.mediaQuery.addEventListener('change', handler);
    } else {
      this.mediaQuery.addListener(handler);
    }
  }

  resolveTheme() {
    if (this.currentTheme === 'system') {
      if (this.mediaQuery?.matches) {
        return 'dark';
      }
      return 'light';
    }
    return this.currentTheme;
  }

  applyTheme() {
    const resolved = this.resolveTheme();
    this.element.setAttribute(this.attribute, resolved);
  }

  notifyListeners() {
    const resolved = this.resolveTheme();
    this.listeners.forEach(fn => fn(resolved));
  }

  setTheme(mode) {
    this.currentTheme = mode;
    this.saveToStorage(mode);
    this.applyTheme();
    this.notifyListeners();
  }

  getTheme() {
    return this.currentTheme;
  }

  toggle() {
    const resolved = this.resolveTheme();
    const next = resolved === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  onThemeChange(callback) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

/**
 * 自动初始化主题切换按钮
 * 扫描所有 [data-ui-component="theme-toggle"] 元素
 * 为每个元素创建 ThemeManager 实例并绑定点击事件
 */
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

// 在 DOM 加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThemeToggles);
} else {
  initThemeToggles();
}
