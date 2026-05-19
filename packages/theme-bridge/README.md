# @ouraihub/theme-bridge

Theme bridge layer for mapping semantic themes to runtime theme providers such as daisyUI.

## Purpose

This package is intended to sit above theme runtime details and below application-facing UI controls.

It helps keep your public theme API stable while allowing an implementation detail such as daisyUI to provide the concrete theme names.

The package is intentionally centered on two reusable files:

- `DaisyThemeBridge.ts`
- `ThemeSwitcher.ts`

## Example

```ts
import {
  DaisyThemeBridge,
  ThemeSwitcher,
  createDaisyThemeBridgeConfig
} from '@ouraihub/theme-bridge';

const themes = createDaisyThemeBridgeConfig({
  light: {
    label: 'Light',
    daisyTheme: 'light',
    mode: 'light',
  },
  dark: {
    label: 'Dark',
    daisyTheme: 'night',
    mode: 'dark',
  },
});

const bridge = new DaisyThemeBridge({
  target: document.documentElement,
  semanticStorageKey: 'ouraihub-theme',
  modeStorageKey: 'ouraihub-theme-mode',
  themes,
  defaultSemanticTheme: 'light',
});

new ThemeSwitcher({
  container: document.getElementById('theme-switcher')!,
  bridge,
});
```

## Subpath imports

You can import the focused modules directly:

```ts
import { DaisyThemeBridge } from '@ouraihub/theme-bridge/DaisyThemeBridge';
import { ThemeSwitcher } from '@ouraihub/theme-bridge/ThemeSwitcher';
```

## Theme validation and curation

The package also exposes:

- `DAISY_THEME_NAMES`
- `RECOMMENDED_OURAIHUB_DAISY_THEMES`
- `isDaisyThemeName`
- `assertDaisyThemeName`

Example:

```ts
import {
  RECOMMENDED_OURAIHUB_DAISY_THEMES,
  assertDaisyThemeName,
} from '@ouraihub/theme-bridge';

const selected = assertDaisyThemeName('night');
console.log(RECOMMENDED_OURAIHUB_DAISY_THEMES.includes(selected));
```

## Recommended usage boundary

Use this package for:

- docs sites
- playgrounds
- demos
- framework-facing presentation layers

Avoid using it as:

- the source of truth for core preset definitions
- the storage location for product-wide design tokens
- a replacement for framework-specific page composition

## Notes

- keep this package as a bridge layer
- do not move framework-specific application rendering here
- do not move core preset definitions here
