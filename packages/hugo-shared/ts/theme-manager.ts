/**
 * ThemeManager - Pure logic class for theme state management
 * DOM binding is left to the consuming theme
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeManagerConfig {
  storageKey?: string;
  attribute?: string;
  element?: HTMLElement;
}

export class ThemeManager {
  private current: ThemeMode;
  private readonly storageKey: string;
  private readonly attribute: string;
  private readonly element: HTMLElement;

  constructor(config: ThemeManagerConfig = {}) {
    this.storageKey = config.storageKey ?? 'theme';
    this.attribute = config.attribute ?? 'data-theme';
    this.element = config.element ?? document.documentElement;
    this.current = this.load();
    this.apply();
    this.watchSystem();
  }

  get resolved(): 'light' | 'dark' {
    return this.resolve(this.current);
  }

  get mode(): ThemeMode {
    return this.current;
  }

  toggle(): void {
    this.current = this.resolved === 'light' ? 'dark' : 'light';
    this.apply();
  }

  setTheme(mode: ThemeMode): void {
    this.current = mode;
    this.apply();
  }

  private getSystemTheme(): 'light' | 'dark' {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private resolve(mode: ThemeMode): 'light' | 'dark' {
    return mode === 'system' ? this.getSystemTheme() : mode;
  }

  private load(): ThemeMode {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch { /* localStorage unavailable */ }
    return 'system';
  }

  private apply(): void {
    this.element.setAttribute(this.attribute, this.resolve(this.current));
    try { localStorage.setItem(this.storageKey, this.current); } catch { /* noop */ }
  }

  private watchSystem(): void {
    window.matchMedia?.('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        if (this.current === 'system') this.apply();
      });
  }
}
