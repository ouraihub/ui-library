export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeOptions {
  storageKey?: string;
  attribute?: string;
  defaultTheme?: ThemeMode;
}

export class ThemeManager {
  private storageKey: string;
  private attribute: string;
  private currentTheme: ThemeMode;
  private mediaQuery: MediaQueryList | null = null;
  private listeners: Array<(theme: ThemeMode) => void> = [];

  constructor(private element: HTMLElement = document.documentElement, options: ThemeOptions = {}) {
    this.storageKey = options.storageKey || 'theme';
    this.attribute = options.attribute || 'data-theme';
    this.currentTheme = options.defaultTheme || 'system';
    
    this.init();
  }

  private init(): void {
    const saved = this.loadFromStorage();
    if (saved) {
      this.currentTheme = saved;
    }
    
    this.applyTheme();
    this.watchSystemTheme();
  }

  private loadFromStorage(): ThemeMode | null {
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

  private saveToStorage(theme: ThemeMode): void {
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch (e) {
      console.warn('[ThemeManager] Failed to save theme');
    }
  }

  private watchSystemTheme(): void {
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

  private resolveTheme(): 'light' | 'dark' {
    if (this.currentTheme === 'system') {
      if (this.mediaQuery?.matches) {
        return 'dark';
      }
      return 'light';
    }
    return this.currentTheme;
  }

  private applyTheme(): void {
    const resolved = this.resolveTheme();
    this.element.setAttribute(this.attribute, resolved);
  }

  private notifyListeners(): void {
    const resolved = this.resolveTheme();
    this.listeners.forEach(fn => fn(resolved));
  }

  public setTheme(mode: ThemeMode): void {
    this.currentTheme = mode;
    this.saveToStorage(mode);
    this.applyTheme();
    this.notifyListeners();
  }

  public getTheme(): ThemeMode {
    return this.currentTheme;
  }

  public toggle(): void {
    const resolved = this.resolveTheme();
    const next = resolved === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  public onThemeChange(callback: (theme: 'light' | 'dark') => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}
