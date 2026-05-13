/**
 * Hugo 包装层自动初始化集成测试
 * 测试场景：
 * 1. data 属性自动扫描（data-theme-toggle）
 * 2. 多个组件同时初始化
 * 3. 初始化顺序验证
 * 4. 错误处理（无效配置、缺少必需属性）
 * 5. DOM 变化后的重新初始化
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// 模拟 Hugo 生成的 HTML 结构
const HUGO_THEME_TOGGLE_HTML = `
  <button 
    data-ui-component="theme-toggle"
    data-ui-storage-key="theme"
    data-ui-attribute="data-theme"
    class="theme-toggle-btn"
    aria-label="切换主题"
  >
    <span class="theme-icon-light">☀️</span>
    <span class="theme-icon-dark">🌙</span>
  </button>
`;

const HUGO_CUSTOM_THEME_TOGGLE_HTML = `
  <button 
    data-ui-component="theme-toggle"
    data-ui-storage-key="custom-theme"
    data-ui-attribute="data-color-scheme"
    class="custom-toggle"
    aria-label="切换颜色方案"
  >
    <span>🎨</span>
  </button>
`;

const HUGO_INVALID_TOGGLE_HTML = `
  <button 
    data-ui-component="theme-toggle"
    class="invalid-toggle"
  >
    <span>❌</span>
  </button>
`;

describe('Hugo 包装层 - 自动初始化集成测试', () => {
  let dom: JSDOM;
  let document: Document;
  let window: Window;
  let localStorage: Storage;
  let initThemeToggles: () => void;
  let ThemeManager: any;

  beforeEach(() => {
    // 创建 jsdom 环境
    dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
    });

    document = dom.window.document;
    window = dom.window as unknown as Window;
    localStorage = dom.window.localStorage;

    // 清空 localStorage
    localStorage.clear();

    // 模拟 console 方法
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // 加载 theme-init.js 的代码（内联到测试中）
    const script = `
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

      window.ThemeManager = ThemeManager;
      window.initThemeToggles = initThemeToggles;
    `;

    // 在 jsdom 环境中执行脚本
    const scriptElement = document.createElement('script');
    scriptElement.textContent = script;
    document.head.appendChild(scriptElement);

    // 获取全局函数
    ThemeManager = (window as any).ThemeManager;
    initThemeToggles = (window as any).initThemeToggles;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('场景 1: data 属性自动扫描', () => {
    it('应该自动扫描并初始化 [data-ui-component="theme-toggle"] 元素', () => {
      // 插入 Hugo 生成的 HTML
      document.body.innerHTML = HUGO_THEME_TOGGLE_HTML;

      // 执行自动初始化
      initThemeToggles();

      // 验证：应该在 documentElement 上设置 data-theme 属性
      const themeAttr = document.documentElement.getAttribute('data-theme');
      expect(themeAttr).toBe('light'); // 默认 system 模式，jsdom 默认为 light
    });

    it('应该读取 data-ui-storage-key 属性', () => {
      document.body.innerHTML = HUGO_THEME_TOGGLE_HTML;
      initThemeToggles();

      const button = document.querySelector('[data-ui-component="theme-toggle"]') as HTMLElement;
      button.click();

      // 验证：应该使用 data-ui-storage-key 指定的键名
      const saved = localStorage.getItem('theme');
      expect(saved).toBe('dark'); // 点击后切换到 dark
    });

    it('应该读取 data-ui-attribute 属性', () => {
      document.body.innerHTML = HUGO_CUSTOM_THEME_TOGGLE_HTML;
      initThemeToggles();

      // 验证：应该使用 data-ui-attribute 指定的属性名
      const colorScheme = document.documentElement.getAttribute('data-color-scheme');
      expect(colorScheme).toBe('light');
    });
  });

  describe('场景 2: 多个组件同时初始化', () => {
    it('应该同时初始化多个主题切换按钮', () => {
      // 插入多个按钮
      document.body.innerHTML = `
        ${HUGO_THEME_TOGGLE_HTML}
        ${HUGO_CUSTOM_THEME_TOGGLE_HTML}
      `;

      initThemeToggles();

      // 验证：两个按钮都应该被初始化
      const buttons = document.querySelectorAll('[data-ui-component="theme-toggle"]');
      expect(buttons.length).toBe(2);

      // 验证：两个属性都应该被设置
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(document.documentElement.getAttribute('data-color-scheme')).toBe('light');
    });

    it('多个按钮应该独立工作', () => {
      document.body.innerHTML = `
        ${HUGO_THEME_TOGGLE_HTML}
        ${HUGO_CUSTOM_THEME_TOGGLE_HTML}
      `;

      initThemeToggles();

      const buttons = Array.from(document.querySelectorAll('[data-ui-component="theme-toggle"]'));
      
      // 点击第一个按钮
      (buttons[0] as HTMLElement).click();
      expect(localStorage.getItem('theme')).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      // 点击第二个按钮
      (buttons[1] as HTMLElement).click();
      expect(localStorage.getItem('custom-theme')).toBe('dark');
      expect(document.documentElement.getAttribute('data-color-scheme')).toBe('dark');
    });
  });

  describe('场景 3: 初始化顺序验证', () => {
    it('应该在 DOM 加载完成后初始化', () => {
      document.body.innerHTML = HUGO_THEME_TOGGLE_HTML;

      // 模拟 DOMContentLoaded 事件
      const event = new dom.window.Event('DOMContentLoaded');
      document.dispatchEvent(event);

      // 验证：初始化应该在事件触发后执行
      // 注意：在测试中我们直接调用 initThemeToggles，实际场景中会通过事件监听器调用
      initThemeToggles();
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('应该先从 localStorage 加载，再应用主题', () => {
      // 预先设置 localStorage
      localStorage.setItem('theme', 'dark');

      document.body.innerHTML = HUGO_THEME_TOGGLE_HTML;
      initThemeToggles();

      // 验证：应该使用 localStorage 中的值
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('应该在应用主题后监听系统主题变化', () => {
      document.body.innerHTML = HUGO_THEME_TOGGLE_HTML;
      initThemeToggles();

      // 验证：mediaQuery 应该被创建
      const manager = new ThemeManager(document.documentElement, {
        storageKey: 'theme',
        attribute: 'data-theme',
      });

      expect(manager.mediaQuery).toBeDefined();
    });
  });

  describe('场景 4: 错误处理', () => {
    it('应该处理缺少 data-ui-storage-key 的情况（使用默认值）', () => {
      document.body.innerHTML = HUGO_INVALID_TOGGLE_HTML;
      initThemeToggles();

      const button = document.querySelector('[data-ui-component="theme-toggle"]') as HTMLElement;
      button.click();

      // 验证：应该使用默认的 'theme' 键名
      const saved = localStorage.getItem('theme');
      expect(saved).toBe('dark');
    });

    it('应该处理缺少 data-ui-attribute 的情况（使用默认值）', () => {
      document.body.innerHTML = HUGO_INVALID_TOGGLE_HTML;
      initThemeToggles();

      // 验证：应该使用默认的 'data-theme' 属性名
      const themeAttr = document.documentElement.getAttribute('data-theme');
      expect(themeAttr).toBe('light');
    });

    it('应该处理 localStorage 不可用的情况', () => {
      // 模拟 localStorage 抛出异常
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn(() => {
        throw new Error('localStorage unavailable');
      });

      document.body.innerHTML = HUGO_THEME_TOGGLE_HTML;
      
      // 不应该抛出异常
      expect(() => initThemeToggles()).not.toThrow();

      // 验证：应该输出警告
      expect(console.warn).toHaveBeenCalledWith('[ThemeManager] localStorage unavailable');

      // 恢复
      localStorage.getItem = originalGetItem;
    });

    it('应该处理无效的 localStorage 值', () => {
      // 设置无效值
      localStorage.setItem('theme', 'invalid-theme');

      document.body.innerHTML = HUGO_THEME_TOGGLE_HTML;
      initThemeToggles();

      // 验证：应该使用默认值 'system'
      expect(document.documentElement.getAttribute('data-theme')).toBe('light'); // system 解析为 light
    });

    it('应该处理没有匹配元素的情况', () => {
      document.body.innerHTML = '<div>No theme toggle here</div>';

      // 不应该抛出异常
      expect(() => initThemeToggles()).not.toThrow();
    });
  });

  describe('场景 5: DOM 变化后的重新初始化', () => {
    it('应该能够在 DOM 变化后重新初始化', () => {
      // 初始状态：没有按钮
      document.body.innerHTML = '<div id="container"></div>';
      initThemeToggles();

      // 验证：没有初始化任何按钮
      expect(document.querySelectorAll('[data-ui-component="theme-toggle"]').length).toBe(0);

      // 动态添加按钮
      const container = document.getElementById('container');
      if (container) {
        container.innerHTML = HUGO_THEME_TOGGLE_HTML;
      }

      // 重新初始化
      initThemeToggles();

      // 验证：新按钮应该被初始化
      const button = document.querySelector('[data-ui-component="theme-toggle"]') as HTMLElement;
      expect(button).toBeDefined();
      
      button.click();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('应该能够处理按钮被移除的情况', () => {
      document.body.innerHTML = HUGO_THEME_TOGGLE_HTML;
      initThemeToggles();

      const button = document.querySelector('[data-ui-component="theme-toggle"]') as HTMLElement;
      button.click();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      // 移除按钮
      button.remove();

      // 验证：主题状态应该保持
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('应该能够处理按钮被替换的情况', () => {
      document.body.innerHTML = `<div id="container">${HUGO_THEME_TOGGLE_HTML}</div>`;
      initThemeToggles();

      // 点击原按钮
      let button = document.querySelector('[data-ui-component="theme-toggle"]') as HTMLElement;
      button.click();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      // 替换按钮
      const container = document.getElementById('container');
      if (container) {
        container.innerHTML = HUGO_CUSTOM_THEME_TOGGLE_HTML;
      }

      // 重新初始化
      initThemeToggles();

      // 验证：新按钮应该工作
      button = document.querySelector('[data-ui-component="theme-toggle"]') as HTMLElement;
      button.click();
      expect(document.documentElement.getAttribute('data-color-scheme')).toBe('dark');
    });
  });

  describe('场景 6: 真实 Hugo partial 输出模拟', () => {
    it('应该处理完整的 Hugo partial 输出', () => {
      // 模拟真实的 Hugo partial 输出（包含样式和结构）
      const hugoPartialOutput = `
        <button 
          data-ui-component="theme-toggle"
          data-ui-storage-key="theme"
          data-ui-attribute="data-theme"
          class="inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="切换主题"
        >
          <span class="theme-icon-light inline-block dark:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          </span>
          <span class="theme-icon-dark hidden dark:inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </span>
        </button>
      `;

      document.body.innerHTML = hugoPartialOutput;
      initThemeToggles();

      // 验证：应该正确初始化
      const button = document.querySelector('[data-ui-component="theme-toggle"]') as HTMLElement;
      expect(button).toBeDefined();
      expect(button.getAttribute('aria-label')).toBe('切换主题');

      // 验证：点击应该工作
      button.click();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });
});
