export type ThemeMode = 'light' | 'dark' | 'system';

export type DaisyThemeName =
  | 'light'
  | 'dark'
  | 'cupcake'
  | 'bumblebee'
  | 'emerald'
  | 'corporate'
  | 'synthwave'
  | 'retro'
  | 'cyberpunk'
  | 'valentine'
  | 'halloween'
  | 'garden'
  | 'forest'
  | 'aqua'
  | 'lofi'
  | 'pastel'
  | 'fantasy'
  | 'wireframe'
  | 'black'
  | 'luxury'
  | 'dracula'
  | 'cmyk'
  | 'autumn'
  | 'business'
  | 'acid'
  | 'lemonade'
  | 'night'
  | 'coffee'
  | 'winter'
  | 'dim'
  | 'nord'
  | 'sunset'
  | 'caramellatte'
  | 'abyss'
  | 'silk';

export interface DaisySemanticThemeConfig {
  label: string;
  daisyTheme: DaisyThemeName;
  mode?: Exclude<ThemeMode, 'system'>;
  description?: string;
}

export type DaisySemanticThemes = Record<string, DaisySemanticThemeConfig>;

export interface DaisyThemeBridgeApplyContext {
  semanticTheme: string;
  daisyTheme: string;
  config: DaisySemanticThemeConfig;
  target: HTMLElement;
}

export interface DaisyThemeBridgeOptions {
  target?: HTMLElement;
  themeAttribute?: string;
  modeAttribute?: string;
  semanticStorageKey?: string;
  modeStorageKey?: string;
  themes: DaisySemanticThemes;
  defaultSemanticTheme: string;
  defaultMode?: ThemeMode;
  onApplyTheme?: (context: DaisyThemeBridgeApplyContext) => void;
}

export interface ThemeSwitcherLabels {
  semanticTitle?: string;
  modeTitle?: string;
  light?: string;
  dark?: string;
  system?: string;
}

export interface ThemeSwitcherOptions {
  container: HTMLElement;
  bridge: {
    themes: DaisySemanticThemes;
    getSemanticTheme(): string;
    setSemanticTheme(name: string): DaisySemanticThemeConfig;
    getMode(): ThemeMode;
    setMode(mode: ThemeMode): void;
    onChange(callback: () => void): () => void;
  };
  labels?: ThemeSwitcherLabels;
  showModeControls?: boolean;
}
