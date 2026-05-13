import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeManager } from '../../src/theme/ThemeManager';
import { qs, qsa, debounce, throttle } from '../../../utils/src/dom';
import type { ThemeMode } from '../../src/theme/types';

describe('Integration: ThemeManager + DOM Utils', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    localStorage.clear();
  });

  describe('ThemeManager + querySelector Integration', () => {
    it('should apply theme to dynamically queried elements', () => {
      container.innerHTML = `
        <div class="theme-target" data-theme="">Target 1</div>
        <div class="theme-target" data-theme="">Target 2</div>
      `;

      const themeManager = new ThemeManager(container);
      themeManager.setTheme('dark');

      const targets = qsa<HTMLElement>('.theme-target', container);
      expect(targets).toHaveLength(2);
      expect(container.getAttribute('data-theme')).toBe('dark');
    });

    it('should handle theme changes with querySelector', () => {
      container.innerHTML = '<div id="theme-indicator"></div>';
      const themeManager = new ThemeManager(container);

      const indicator = qs<HTMLElement>('#theme-indicator', container);
      expect(indicator).not.toBeNull();

      themeManager.onThemeChange((theme) => {
        if (indicator) {
          indicator.textContent = theme;
        }
      });

      themeManager.setTheme('light');
      expect(indicator?.textContent).toBe('light');

      themeManager.setTheme('dark');
      expect(indicator?.textContent).toBe('dark');
    });

    it('should update multiple elements on theme change', () => {
      container.innerHTML = `
        <div class="card" data-variant=""></div>
        <div class="card" data-variant=""></div>
        <div class="card" data-variant=""></div>
      `;

      const themeManager = new ThemeManager(container);

      themeManager.onThemeChange((theme) => {
        const cards = qsa<HTMLElement>('.card', container);
        cards.forEach(card => {
          card.setAttribute('data-variant', theme);
        });
      });

      themeManager.setTheme('dark');
      const cards = qsa<HTMLElement>('.card', container);
      cards.forEach(card => {
        expect(card.getAttribute('data-variant')).toBe('dark');
      });
    });

    it('should handle non-existent elements gracefully', () => {
      const themeManager = new ThemeManager(container);
      const nonExistent = qs('#does-not-exist', container);
      
      expect(nonExistent).toBeNull();
      expect(() => {
        themeManager.setTheme('dark');
      }).not.toThrow();
    });
  });

  describe('Event System + DOM Operations', () => {
    it('should trigger DOM updates via onThemeChange', () => {
      container.innerHTML = '<div id="status"></div>';
      const themeManager = new ThemeManager(container);
      const status = qs<HTMLElement>('#status', container);

      const updateDOM = (theme: ThemeMode) => {
        if (status) {
          status.textContent = `Current theme: ${theme}`;
          status.className = `theme-${theme}`;
        }
      };

      themeManager.onThemeChange(updateDOM);
      themeManager.setTheme('light');

      expect(status?.textContent).toBe('Current theme: light');
      expect(status?.className).toBe('theme-light');
    });

    it('should handle multiple DOM updates from single theme change', () => {
      container.innerHTML = `
        <div id="header"></div>
        <div id="sidebar"></div>
        <div id="footer"></div>
      `;

      const themeManager = new ThemeManager(container);
      const updates: string[] = [];

      themeManager.onThemeChange((theme) => {
        const header = qs<HTMLElement>('#header', container);
        const sidebar = qs<HTMLElement>('#sidebar', container);
        const footer = qs<HTMLElement>('#footer', container);

        if (header) {
          header.setAttribute('data-theme', theme);
          updates.push('header');
        }
        if (sidebar) {
          sidebar.setAttribute('data-theme', theme);
          updates.push('sidebar');
        }
        if (footer) {
          footer.setAttribute('data-theme', theme);
          updates.push('footer');
        }
      });

      themeManager.setTheme('dark');

      expect(updates).toEqual(['header', 'sidebar', 'footer']);
      expect(qs('#header', container)?.getAttribute('data-theme')).toBe('dark');
      expect(qs('#sidebar', container)?.getAttribute('data-theme')).toBe('dark');
      expect(qs('#footer', container)?.getAttribute('data-theme')).toBe('dark');
    });

    it('should work with debounced theme changes', () => {
      vi.useFakeTimers();
      
      container.innerHTML = '<div id="counter">0</div>';
      const themeManager = new ThemeManager(container);
      const counter = qs<HTMLElement>('#counter', container);
      let count = 0;

      const debouncedUpdate = debounce(() => {
        count++;
        if (counter) {
          counter.textContent = count.toString();
        }
      }, 100);

      themeManager.onThemeChange(debouncedUpdate);

      themeManager.setTheme('light');
      themeManager.setTheme('dark');
      themeManager.setTheme('light');

      expect(counter?.textContent).toBe('0');

      vi.advanceTimersByTime(100);

      expect(counter?.textContent).toBe('1');
      expect(count).toBe(1);

      vi.useRealTimers();
    });

    it('should work with throttled theme changes', () => {
      vi.useFakeTimers();
      
      container.innerHTML = '<div id="counter">0</div>';
      const themeManager = new ThemeManager(container);
      const counter = qs<HTMLElement>('#counter', container);
      let count = 0;

      const throttledUpdate = throttle(() => {
        count++;
        if (counter) {
          counter.textContent = count.toString();
        }
      }, 100);

      themeManager.onThemeChange(throttledUpdate);

      themeManager.setTheme('light');
      expect(count).toBe(1);

      themeManager.setTheme('dark');
      expect(count).toBe(1);

      vi.advanceTimersByTime(100);
      themeManager.setTheme('light');
      expect(count).toBe(2);

      vi.useRealTimers();
    });
  });

  describe('Multiple ThemeManager Instances', () => {
    it('should manage independent theme states', () => {
      const container1 = document.createElement('div');
      const container2 = document.createElement('div');
      document.body.appendChild(container1);
      document.body.appendChild(container2);

      const manager1 = new ThemeManager(container1, { storageKey: 'theme1' });
      const manager2 = new ThemeManager(container2, { storageKey: 'theme2' });

      manager1.setTheme('light');
      manager2.setTheme('dark');

      expect(manager1.getTheme()).toBe('light');
      expect(manager2.getTheme()).toBe('dark');
      expect(container1.getAttribute('data-theme')).toBe('light');
      expect(container2.getAttribute('data-theme')).toBe('dark');

      document.body.removeChild(container1);
      document.body.removeChild(container2);
    });

    it('should coordinate multiple instances with shared DOM updates', () => {
      const container1 = document.createElement('div');
      const container2 = document.createElement('div');
      container1.innerHTML = '<div class="shared-element">Element 1</div>';
      container2.innerHTML = '<div class="shared-element">Element 2</div>';
      document.body.appendChild(container1);
      document.body.appendChild(container2);

      const manager1 = new ThemeManager(container1, { storageKey: 'theme1' });
      const manager2 = new ThemeManager(container2, { storageKey: 'theme2' });

      const updates: Array<{ manager: number; theme: ThemeMode }> = [];

      manager1.onThemeChange((theme) => {
        updates.push({ manager: 1, theme });
      });

      manager2.onThemeChange((theme) => {
        updates.push({ manager: 2, theme });
      });

      manager1.setTheme('dark');
      manager2.setTheme('light');

      expect(updates).toEqual([
        { manager: 1, theme: 'dark' },
        { manager: 2, theme: 'light' }
      ]);

      document.body.removeChild(container1);
      document.body.removeChild(container2);
    });

    it('should handle cross-instance DOM queries', () => {
      const container1 = document.createElement('div');
      const container2 = document.createElement('div');
      container1.id = 'container1';
      container2.id = 'container2';
      container1.innerHTML = '<div class="item">Item 1</div>';
      container2.innerHTML = '<div class="item">Item 2</div>';
      document.body.appendChild(container1);
      document.body.appendChild(container2);

      const manager1 = new ThemeManager(container1, { storageKey: 'theme1' });
      const manager2 = new ThemeManager(container2, { storageKey: 'theme2' });

      manager1.onThemeChange(() => {
        const allItems = qsa<HTMLElement>('.item');
        expect(allItems.length).toBeGreaterThanOrEqual(2);
      });

      manager1.setTheme('dark');

      const item1 = qs<HTMLElement>('.item', container1);
      const item2 = qs<HTMLElement>('.item', container2);

      expect(item1?.textContent).toBe('Item 1');
      expect(item2?.textContent).toBe('Item 2');

      document.body.removeChild(container1);
      document.body.removeChild(container2);
    });
  });

  describe('Memory Leak Detection', () => {
    it('should clean up event listeners on unsubscribe', () => {
      const themeManager = new ThemeManager(container);
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      const unsubscribe1 = themeManager.onThemeChange(callback1);
      const unsubscribe2 = themeManager.onThemeChange(callback2);
      const unsubscribe3 = themeManager.onThemeChange(callback3);

      themeManager.setTheme('light');
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(1);

      unsubscribe1();
      unsubscribe2();

      themeManager.setTheme('dark');
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(2);

      unsubscribe3();

      themeManager.setTheme('light');
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(2);
    });

    it('should not leak DOM references in callbacks', () => {
      container.innerHTML = '<div id="target"></div>';
      const themeManager = new ThemeManager(container);
      
      let targetRef: HTMLElement | null = qs('#target', container);
      expect(targetRef).not.toBeNull();

      const unsubscribe = themeManager.onThemeChange(() => {
        if (targetRef) {
          targetRef.textContent = 'updated';
        }
      });

      themeManager.setTheme('dark');
      expect(targetRef?.textContent).toBe('updated');

      unsubscribe();
      targetRef = null;

      themeManager.setTheme('light');
      expect(targetRef).toBeNull();
    });

    it('should handle rapid subscribe/unsubscribe cycles', () => {
      const themeManager = new ThemeManager(container);
      const callbacks: Array<() => void> = [];

      for (let i = 0; i < 100; i++) {
        const callback = vi.fn();
        const unsubscribe = themeManager.onThemeChange(callback);
        callbacks.push(unsubscribe);
      }

      themeManager.setTheme('dark');

      callbacks.forEach(unsubscribe => unsubscribe());

      themeManager.setTheme('light');

      expect(() => {
        themeManager.setTheme('dark');
      }).not.toThrow();
    });

    it('should clean up debounced callbacks', () => {
      vi.useFakeTimers();
      
      const themeManager = new ThemeManager(container);
      const callback = vi.fn();
      const debouncedCallback = debounce(callback, 100);

      const unsubscribe = themeManager.onThemeChange(debouncedCallback);

      themeManager.setTheme('light');
      themeManager.setTheme('dark');

      unsubscribe();

      vi.advanceTimersByTime(100);

      expect(callback).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should clean up throttled callbacks', () => {
      vi.useFakeTimers();
      
      const themeManager = new ThemeManager(container);
      const callback = vi.fn();
      const throttledCallback = throttle(callback, 100);

      const unsubscribe = themeManager.onThemeChange(throttledCallback);

      themeManager.setTheme('light');
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();

      vi.advanceTimersByTime(100);
      themeManager.setTheme('dark');

      expect(callback).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });

  describe('Edge Cases', () => {
    it('should handle DOM element removal during theme change', () => {
      container.innerHTML = '<div id="removable"></div>';
      const themeManager = new ThemeManager(container);

      themeManager.onThemeChange(() => {
        const element = qs('#removable', container);
        if (element) {
          element.remove();
        }
      });

      expect(() => {
        themeManager.setTheme('dark');
      }).not.toThrow();

      expect(qs('#removable', container)).toBeNull();
    });

    it('should handle repeated initialization on same element', () => {
      const manager1 = new ThemeManager(container, { storageKey: 'theme1' });
      manager1.setTheme('light');

      const manager2 = new ThemeManager(container, { storageKey: 'theme2' });
      manager2.setTheme('dark');

      expect(container.getAttribute('data-theme')).toBe('dark');
      expect(manager1.getTheme()).toBe('light');
      expect(manager2.getTheme()).toBe('dark');
    });

    it('should handle theme changes with empty container', () => {
      container.innerHTML = '';
      const themeManager = new ThemeManager(container);

      expect(() => {
        themeManager.setTheme('dark');
        const elements = qsa('.non-existent', container);
        expect(elements).toHaveLength(0);
      }).not.toThrow();
    });

    it('should handle complex DOM structures', () => {
      container.innerHTML = `
        <div class="level-1">
          <div class="level-2">
            <div class="level-3">
              <div class="level-4" id="deep-target">Deep</div>
            </div>
          </div>
        </div>
      `;

      const themeManager = new ThemeManager(container);

      themeManager.onThemeChange((theme) => {
        const deepTarget = qs<HTMLElement>('#deep-target', container);
        if (deepTarget) {
          deepTarget.setAttribute('data-theme', theme);
        }
      });

      themeManager.setTheme('dark');

      const deepTarget = qs('#deep-target', container);
      expect(deepTarget?.getAttribute('data-theme')).toBe('dark');
    });

    it('should handle concurrent theme changes', () => {
      const themeManager = new ThemeManager(container);
      const updates: ThemeMode[] = [];

      themeManager.onThemeChange((theme) => {
        updates.push(theme);
      });

      themeManager.setTheme('light');
      themeManager.setTheme('dark');
      themeManager.setTheme('system');
      themeManager.setTheme('light');

      expect(updates).toEqual(['light', 'dark', 'light', 'light']);
      expect(themeManager.getTheme()).toBe('light');
    });

    it('should handle theme changes during callback execution', () => {
      const themeManager = new ThemeManager(container);
      let callbackCount = 0;

      themeManager.onThemeChange((theme) => {
        callbackCount++;
        if (callbackCount === 1 && theme === 'light') {
          themeManager.setTheme('dark');
        }
      });

      themeManager.setTheme('light');

      expect(callbackCount).toBe(2);
      expect(themeManager.getTheme()).toBe('dark');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should support theme toggle button with DOM updates', () => {
      container.innerHTML = `
        <button id="theme-toggle">Toggle Theme</button>
        <div id="content">Content</div>
      `;

      const themeManager = new ThemeManager(container);
      const button = qs<HTMLButtonElement>('#theme-toggle', container);
      const content = qs<HTMLElement>('#content', container);

      themeManager.onThemeChange((theme) => {
        if (button) {
          button.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
        }
        if (content) {
          content.className = `theme-${theme}`;
        }
      });

      themeManager.setTheme('dark');
      expect(button?.textContent).toBe('Light Mode');
      expect(content?.className).toBe('theme-dark');

      themeManager.toggle();
      expect(button?.textContent).toBe('Dark Mode');
      expect(content?.className).toBe('theme-light');
    });

    it('should support theme persistence across page reloads', () => {
      const manager1 = new ThemeManager(container);
      manager1.setTheme('dark');

      const newContainer = document.createElement('div');
      document.body.appendChild(newContainer);

      const manager2 = new ThemeManager(newContainer);
      expect(manager2.getTheme()).toBe('dark');
      expect(newContainer.getAttribute('data-theme')).toBe('dark');

      document.body.removeChild(newContainer);
    });

    it('should support theme-aware component initialization', () => {
      container.innerHTML = `
        <div class="card">Card 1</div>
        <div class="card">Card 2</div>
        <div class="card">Card 3</div>
      `;

      const themeManager = new ThemeManager(container, { defaultTheme: 'dark' });

      const cards = qsa<HTMLElement>('.card', container);
      cards.forEach(card => {
        card.setAttribute('data-theme', themeManager.getTheme());
      });

      cards.forEach(card => {
        expect(card.getAttribute('data-theme')).toBe('dark');
      });
    });
  });
});
