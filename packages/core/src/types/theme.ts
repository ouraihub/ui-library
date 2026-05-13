export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeOptions {
  storageKey?: string;
  attribute?: string;
  defaultTheme?: ThemeMode;
}
