import type { DaisySemanticThemes, DaisyThemeName } from './types';

export const DAISY_THEME_NAMES = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
  'dim',
  'nord',
  'sunset',
  'caramellatte',
  'abyss',
  'silk',
] as const satisfies readonly DaisyThemeName[];

export const RECOMMENDED_OURAIHUB_DAISY_THEMES = [
  'light',
  'night',
  'corporate',
  'emerald',
  'nord',
  'winter',
  'dim',
  'silk',
  'cupcake',
  'sunset',
] as const satisfies readonly DaisyThemeName[];

export function createDaisyThemeBridgeConfig<T extends DaisySemanticThemes>(themes: T): T {
  return themes;
}

export function isDaisyThemeName(theme: string): theme is DaisyThemeName {
  return (DAISY_THEME_NAMES as readonly string[]).includes(theme);
}

export function assertDaisyThemeName(theme: string): DaisyThemeName {
  if (!isDaisyThemeName(theme)) {
    throw new Error(
      `[theme-bridge] "${theme}" is not in the known daisyUI theme list.`,
    );
  }
  return theme;
}
