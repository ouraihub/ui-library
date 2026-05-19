// @vitest-environment jsdom

import { describe, expect, it, beforeEach } from 'vitest';
import { DaisyThemeBridge } from '../src/DaisyThemeBridge';
import { ThemeSwitcher } from '../src/ThemeSwitcher';
import {
  assertDaisyThemeName,
  createDaisyThemeBridgeConfig,
  isDaisyThemeName,
  RECOMMENDED_OURAIHUB_DAISY_THEMES,
} from '../src/helpers';

describe('DaisyThemeBridge', () => {
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
    playful: {
      label: 'Playful',
      daisyTheme: 'cupcake',
      description: 'Demo mood',
    },
  });

  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-theme-mode');
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('applies the configured daisy theme and mode to the target element', () => {
    const bridge = new DaisyThemeBridge({
      target: document.documentElement,
      themes,
      defaultSemanticTheme: 'light',
    });

    bridge.setSemanticTheme('dark');

    expect(document.documentElement.getAttribute('data-theme')).toBe('night');
    expect(document.documentElement.getAttribute('data-theme-mode')).toBe('dark');
    expect(bridge.getSemanticTheme()).toBe('dark');
    expect(bridge.getMode()).toBe('dark');
  });

  it('renders a ThemeSwitcher that updates the bridge when clicked', () => {
    const bridge = new DaisyThemeBridge({
      target: document.documentElement,
      themes,
      defaultSemanticTheme: 'light',
    });

    const container = document.createElement('div');
    document.body.appendChild(container);

    new ThemeSwitcher({
      container,
      bridge,
    });

    const darkButton = container.querySelector('[data-semantic-theme="dark"]');
    expect(darkButton).not.toBeNull();

    darkButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(bridge.getSemanticTheme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('night');
  });

  it('validates daisy theme names and exposes a curated recommended list', () => {
    expect(isDaisyThemeName('night')).toBe(true);
    expect(isDaisyThemeName('not-a-theme')).toBe(false);
    expect(assertDaisyThemeName('emerald')).toBe('emerald');
    expect(RECOMMENDED_OURAIHUB_DAISY_THEMES).toContain('night');
  });
});
