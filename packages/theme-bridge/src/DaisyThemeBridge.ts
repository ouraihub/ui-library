import type {
  DaisySemanticThemeConfig,
  DaisySemanticThemes,
  ThemeMode,
  DaisyThemeBridgeOptions,
} from './types';

const DEFAULT_APPLIER = ({
  daisyTheme,
  target,
}: {
  daisyTheme: string;
  target: HTMLElement;
}): void => {
  target.setAttribute('data-theme', daisyTheme);
};

export class DaisyThemeBridge {
  private target: HTMLElement;
  private themeAttribute: string;
  private modeAttribute: string;
  private semanticStorageKey: string;
  private modeStorageKey: string;
  private themes: DaisySemanticThemes;
  private defaultSemanticTheme: string;
  private defaultMode: ThemeMode;
  private onApplyTheme: NonNullable<DaisyThemeBridgeOptions['onApplyTheme']>;
  private currentSemanticTheme: string;
  private currentMode: ThemeMode;
  private mediaQuery: MediaQueryList | null = null;
  private listeners: Array<() => void> = [];

  constructor(options: DaisyThemeBridgeOptions) {
    this.target = options.target || document.documentElement;
    this.themeAttribute = options.themeAttribute || 'data-theme';
    this.modeAttribute = options.modeAttribute || 'data-theme-mode';
    this.semanticStorageKey = options.semanticStorageKey || 'semantic-theme';
    this.modeStorageKey = options.modeStorageKey || 'theme-mode';
    this.themes = options.themes;
    this.defaultSemanticTheme = options.defaultSemanticTheme;
    this.defaultMode = options.defaultMode || 'system';
    this.onApplyTheme = options.onApplyTheme || DEFAULT_APPLIER;
    this.currentSemanticTheme = this.loadSemanticTheme() || this.defaultSemanticTheme;
    this.currentMode = this.loadMode() || this.defaultMode;
    this.mediaQuery = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

    this.applyCurrentTheme();
    this.watchSystemTheme();
  }

  private loadSemanticTheme(): string | null {
    try {
      return localStorage.getItem(this.semanticStorageKey);
    } catch {
      return null;
    }
  }

  private loadMode(): ThemeMode | null {
    try {
      const saved = localStorage.getItem(this.modeStorageKey);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch {
      return null;
    }
    return null;
  }

  private saveSemanticTheme(theme: string): void {
    try {
      localStorage.setItem(this.semanticStorageKey, theme);
    } catch {
      console.warn('[DaisyThemeBridge] Failed to save semantic theme');
    }
  }

  private saveMode(mode: ThemeMode): void {
    try {
      localStorage.setItem(this.modeStorageKey, mode);
    } catch {
      console.warn('[DaisyThemeBridge] Failed to save theme mode');
    }
  }

  public getThemeConfig(name: string): DaisySemanticThemeConfig {
    const config = this.themes[name] || this.themes[this.defaultSemanticTheme];
    if (!config) {
      throw new Error(
        `[DaisyThemeBridge] Theme "${name}" is missing and default theme "${this.defaultSemanticTheme}" is not configured.`,
      );
    }
    return config;
  }

  public resolveMode(): Exclude<ThemeMode, 'system'> {
    if (this.currentMode === 'system') {
      return this.mediaQuery?.matches ? 'dark' : 'light';
    }
    return this.currentMode;
  }

  private applyMode(): void {
    this.target.setAttribute(this.modeAttribute, this.resolveMode());
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  private watchSystemTheme(): void {
    if (!this.mediaQuery) return;

    const handler = () => {
      if (this.currentMode === 'system') {
        this.applyMode();
        this.notify();
      }
    };

    if (this.mediaQuery.addEventListener) {
      this.mediaQuery.addEventListener('change', handler);
    } else {
      this.mediaQuery.addListener(handler);
    }
  }

  private applyCurrentTheme(): void {
    const config = this.getThemeConfig(this.currentSemanticTheme);
    this.target.setAttribute(this.themeAttribute, config.daisyTheme);
    this.applyMode();
    this.onApplyTheme({
      semanticTheme: this.currentSemanticTheme,
      daisyTheme: config.daisyTheme,
      config,
      target: this.target,
    });
  }

  public setSemanticTheme(name: string): DaisySemanticThemeConfig {
    this.currentSemanticTheme = name;
    this.saveSemanticTheme(name);
    const config = this.getThemeConfig(name);
    if (config.mode) {
      this.currentMode = config.mode;
      this.saveMode(config.mode);
    }
    this.applyCurrentTheme();
    this.notify();
    return config;
  }

  public getSemanticTheme(): string {
    return this.currentSemanticTheme;
  }

  public getMode(): ThemeMode {
    return this.currentMode;
  }

  public setMode(mode: ThemeMode): void {
    this.currentMode = mode;
    this.saveMode(mode);
    this.applyMode();
    this.notify();
  }

  public onChange(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}
