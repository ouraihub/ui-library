import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeManager } from '../../src/theme/ThemeManager';
import type { ThemeMode } from '../../src/theme/types';

describe('ThemeManager', () => {
  let element: HTMLElement;
  let themeManager: ThemeManager;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
    localStorage.clear();
  });

  describe('Constructor', () => {
    it('should initialize with default values', () => {
      themeManager = new ThemeManager(element);
      expect(themeManager.getTheme()).toBe('system');
      expect(element.getAttribute('data-theme')).toBeTruthy();
    });

    it('should accept custom storageKey', () => {
      themeManager = new ThemeManager(element, { storageKey: 'custom-theme' });
      themeManager.setTheme('light');
      expect(localStorage.getItem('custom-theme')).toBe('light');
    });

    it('should accept custom attribute', () => {
      themeManager = new ThemeManager(element, { attribute: 'data-color-scheme' });
      themeManager.setTheme('dark');
      expect(element.getAttribute('data-color-scheme')).toBe('dark');
    });

    it('should accept custom defaultTheme', () => {
      themeManager = new ThemeManager(element, { defaultTheme: 'dark' });
      expect(themeManager.getTheme()).toBe('dark');
    });

    it('should use document.documentElement as default element', () => {
      themeManager = new ThemeManager();
      themeManager.setTheme('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('setTheme()', () => {
    beforeEach(() => {
      themeManager = new ThemeManager(element);
    });

    it('should set light theme', () => {
      themeManager.setTheme('light');
      expect(themeManager.getTheme()).toBe('light');
      expect(element.getAttribute('data-theme')).toBe('light');
      expect(localStorage.getItem('theme')).toBe('light');
    });

    it('should set dark theme', () => {
      themeManager.setTheme('dark');
      expect(themeManager.getTheme()).toBe('dark');
      expect(element.getAttribute('data-theme')).toBe('dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('should set system theme', () => {
      themeManager.setTheme('system');
      expect(themeManager.getTheme()).toBe('system');
      expect(localStorage.getItem('theme')).toBe('system');
    });

    it('should persist to localStorage', () => {
      themeManager.setTheme('light');
      expect(localStorage.getItem('theme')).toBe('light');
      themeManager.setTheme('dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('should update DOM attribute', () => {
      themeManager.setTheme('light');
      expect(element.getAttribute('data-theme')).toBe('light');
      themeManager.setTheme('dark');
      expect(element.getAttribute('data-theme')).toBe('dark');
    });

    it('should trigger theme change callback', () => {
      const callback = vi.fn();
      themeManager.onThemeChange(callback);
      themeManager.setTheme('light');
      expect(callback).toHaveBeenCalledWith('light');
      themeManager.setTheme('dark');
      expect(callback).toHaveBeenCalledWith('dark');
    });
  });

  describe('getTheme()', () => {
    beforeEach(() => {
      themeManager = new ThemeManager(element);
    });

    it('should return current theme', () => {
      expect(themeManager.getTheme()).toBe('system');
      themeManager.setTheme('light');
      expect(themeManager.getTheme()).toBe('light');
      themeManager.setTheme('dark');
      expect(themeManager.getTheme()).toBe('dark');
    });

    it('should return theme loaded from localStorage', () => {
      localStorage.setItem('theme', 'dark');
      themeManager = new ThemeManager(element);
      expect(themeManager.getTheme()).toBe('dark');
    });
  });

  describe('toggle()', () => {
    beforeEach(() => {
      themeManager = new ThemeManager(element);
    });

    it('should toggle from light to dark', () => {
      themeManager.setTheme('light');
      themeManager.toggle();
      expect(themeManager.getTheme()).toBe('dark');
      expect(element.getAttribute('data-theme')).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      themeManager.setTheme('dark');
      themeManager.toggle();
      expect(themeManager.getTheme()).toBe('light');
      expect(element.getAttribute('data-theme')).toBe('light');
    });

    it('should toggle based on system preference in system mode', () => {
      (window.matchMedia as any).mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));

      themeManager = new ThemeManager(element, { defaultTheme: 'system' });
      themeManager.toggle();
      expect(themeManager.getTheme()).toBe('light');
      expect(element.getAttribute('data-theme')).toBe('light');
    });

    it('should persist toggled theme', () => {
      themeManager.setTheme('light');
      themeManager.toggle();
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('should trigger theme change callback', () => {
      const callback = vi.fn();
      themeManager.onThemeChange(callback);
      themeManager.setTheme('light');
      callback.mockClear();
      themeManager.toggle();
      expect(callback).toHaveBeenCalledWith('dark');
    });
  });

  describe('System theme resolution', () => {
    it('should resolve to dark when matchMedia returns true', () => {
      (window.matchMedia as any).mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));

      themeManager = new ThemeManager(element, { defaultTheme: 'system' });
      expect(element.getAttribute('data-theme')).toBe('dark');
    });

    it('should resolve to light when matchMedia returns false', () => {
      (window.matchMedia as any).mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));

      themeManager = new ThemeManager(element, { defaultTheme: 'system' });
      expect(element.getAttribute('data-theme')).toBe('light');
    });

    it('should return resolved theme to callback in system mode', () => {
      (window.matchMedia as any).mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));

      themeManager = new ThemeManager(element, { defaultTheme: 'system' });
      const callback = vi.fn();
      themeManager.onThemeChange(callback);
      themeManager.setTheme('system');
      expect(callback).toHaveBeenCalledWith('dark');
    });
  });

  describe('onThemeChange()', () => {
    beforeEach(() => {
      themeManager = new ThemeManager(element);
    });

    it('should register callback function', () => {
      const callback = vi.fn();
      themeManager.onThemeChange(callback);
      themeManager.setTheme('light');
      expect(callback).toHaveBeenCalledWith('light');
    });

    it('should trigger callback on theme change', () => {
      const callback = vi.fn();
      themeManager.onThemeChange(callback);
      themeManager.setTheme('light');
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('light');
      themeManager.setTheme('dark');
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith('dark');
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = themeManager.onThemeChange(callback);
      expect(typeof unsubscribe).toBe('function');
    });

    it('should not trigger callback after unsubscribe', () => {
      const callback = vi.fn();
      const unsubscribe = themeManager.onThemeChange(callback);
      themeManager.setTheme('light');
      expect(callback).toHaveBeenCalledTimes(1);
      unsubscribe();
      themeManager.setTheme('dark');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should support multiple callbacks', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      themeManager.onThemeChange(callback1);
      themeManager.onThemeChange(callback2);
      themeManager.setTheme('light');
      expect(callback1).toHaveBeenCalledWith('light');
      expect(callback2).toHaveBeenCalledWith('light');
    });

    it('should support independent unsubscribe', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const unsubscribe1 = themeManager.onThemeChange(callback1);
      themeManager.onThemeChange(callback2);
      themeManager.setTheme('light');
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      unsubscribe1();
      themeManager.setTheme('dark');
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(2);
    });
  });

  describe('Media query listening', () => {
    it('should listen to system theme changes in system mode', () => {
      const addEventListenerMock = vi.fn();
      (window.matchMedia as any).mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: addEventListenerMock,
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));

      themeManager = new ThemeManager(element, { defaultTheme: 'system' });
      expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should auto-update when system theme changes', () => {
      let changeHandler: ((event: MediaQueryListEvent) => void) | null = null;

      (window.matchMedia as any).mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: (event: string, handler: (event: MediaQueryListEvent) => void) => {
          if (event === 'change') {
            changeHandler = handler;
          }
        },
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));

      themeManager = new ThemeManager(element, { defaultTheme: 'system' });
      expect(element.getAttribute('data-theme')).toBe('light');

      (window.matchMedia as any).mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));

      if (changeHandler) {
        changeHandler(new Event('change') as MediaQueryListEvent);
      }

      expect(element.getAttribute('data-theme')).toBe('dark');
    });

    it('should not respond to system theme changes in non-system mode', () => {
      let changeHandler: ((event: MediaQueryListEvent) => void) | null = null;

      (window.matchMedia as any).mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: (event: string, handler: (event: MediaQueryListEvent) => void) => {
          if (event === 'change') {
            changeHandler = handler;
          }
        },
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));

      themeManager = new ThemeManager(element, { defaultTheme: 'light' });
      expect(element.getAttribute('data-theme')).toBe('light');

      (window.matchMedia as any).mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));

      if (changeHandler) {
        changeHandler(new Event('change') as MediaQueryListEvent);
      }

      expect(element.getAttribute('data-theme')).toBe('light');
    });

    it('should trigger callback on system theme change', () => {
      let changeHandler: ((event: MediaQueryListEvent) => void) | null = null;

      (window.matchMedia as any).mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: (event: string, handler: (event: MediaQueryListEvent) => void) => {
          if (event === 'change') {
            changeHandler = handler;
          }
        },
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));

      themeManager = new ThemeManager(element, { defaultTheme: 'system' });
      const callback = vi.fn();
      themeManager.onThemeChange(callback);

      (window.matchMedia as any).mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));

      if (changeHandler) {
        changeHandler(new Event('change') as MediaQueryListEvent);
      }

      expect(callback).toHaveBeenCalledWith('dark');
    });
  });

  describe('Edge cases', () => {
    it('should gracefully degrade when localStorage is unavailable', () => {
      const originalLocalStorage = global.localStorage;
      Object.defineProperty(global, 'localStorage', {
        value: {
          getItem: () => {
            throw new Error('localStorage unavailable');
          },
          setItem: () => {
            throw new Error('localStorage unavailable');
          },
          removeItem: vi.fn(),
          clear: vi.fn(),
          length: 0,
          key: vi.fn()
        },
        writable: true
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      themeManager = new ThemeManager(element);
      themeManager.setTheme('light');

      expect(consoleSpy).toHaveBeenCalled();
      expect(element.getAttribute('data-theme')).toBe('light');

      consoleSpy.mockRestore();
      Object.defineProperty(global, 'localStorage', {
        value: originalLocalStorage,
        writable: true
      });
    });

    it('should gracefully degrade when matchMedia is unavailable', () => {
      const originalMatchMedia = window.matchMedia;
      Object.defineProperty(window, 'matchMedia', {
        value: undefined,
        writable: true
      });

      themeManager = new ThemeManager(element, { defaultTheme: 'system' });
      expect(element.getAttribute('data-theme')).toBe('light');

      Object.defineProperty(window, 'matchMedia', {
        value: originalMatchMedia,
        writable: true
      });
    });

    it('should ignore invalid storage values', () => {
      localStorage.setItem('theme', 'invalid-theme' as any);
      themeManager = new ThemeManager(element);
      expect(themeManager.getTheme()).toBe('system');
    });

    it('should handle empty storage values', () => {
      localStorage.setItem('theme', '');
      themeManager = new ThemeManager(element);
      expect(themeManager.getTheme()).toBe('system');
    });

    it('should maintain consistency after multiple toggles', () => {
      themeManager = new ThemeManager(element);
      for (let i = 0; i < 10; i++) {
        themeManager.toggle();
      }
      expect(themeManager.getTheme()).toBe('light');
      expect(element.getAttribute('data-theme')).toBe('light');
      expect(localStorage.getItem('theme')).toBe('light');
    });

    it('should handle rapid consecutive theme settings', () => {
      const callback = vi.fn();
      themeManager = new ThemeManager(element);
      themeManager.onThemeChange(callback);
      themeManager.setTheme('light');
      themeManager.setTheme('dark');
      themeManager.setTheme('light');
      expect(callback).toHaveBeenCalledTimes(3);
      expect(themeManager.getTheme()).toBe('light');
    });
  });

  describe('Integration scenarios', () => {
    it('should support complete theme lifecycle', () => {
      (window.matchMedia as any).mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));

      themeManager = new ThemeManager(element, {
        storageKey: 'app-theme',
        attribute: 'data-color-scheme',
        defaultTheme: 'light'
      });

      const callback = vi.fn();
      themeManager.onThemeChange(callback);

      expect(themeManager.getTheme()).toBe('light');
      expect(element.getAttribute('data-color-scheme')).toBe('light');

      themeManager.setTheme('dark');
      expect(themeManager.getTheme()).toBe('dark');
      expect(element.getAttribute('data-color-scheme')).toBe('dark');
      expect(localStorage.getItem('app-theme')).toBe('dark');
      expect(callback).toHaveBeenCalledWith('dark');

      themeManager.setTheme('system');
      expect(themeManager.getTheme()).toBe('system');
      expect(localStorage.getItem('app-theme')).toBe('system');

      themeManager.toggle();
      expect(themeManager.getTheme()).toBe('light');
      expect(callback).toHaveBeenCalledWith('light');
    });

    it('should restore theme after page reload', () => {
      themeManager = new ThemeManager(element);
      themeManager.setTheme('dark');
      expect(localStorage.getItem('theme')).toBe('dark');

      const newElement = document.createElement('div');
      document.body.appendChild(newElement);

      const newThemeManager = new ThemeManager(newElement);
      expect(newThemeManager.getTheme()).toBe('dark');
      expect(newElement.getAttribute('data-theme')).toBe('dark');

      document.body.removeChild(newElement);
    });

    it('should support multiple independent instances', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');
      document.body.appendChild(element1);
      document.body.appendChild(element2);

      const manager1 = new ThemeManager(element1, { storageKey: 'theme1' });
      const manager2 = new ThemeManager(element2, { storageKey: 'theme2' });

      manager1.setTheme('light');
      manager2.setTheme('dark');

      expect(manager1.getTheme()).toBe('light');
      expect(manager2.getTheme()).toBe('dark');
      expect(element1.getAttribute('data-theme')).toBe('light');
      expect(element2.getAttribute('data-theme')).toBe('dark');

      document.body.removeChild(element1);
      document.body.removeChild(element2);
    });
  });
});
