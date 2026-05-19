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

  it('supports system mode, custom apply hooks, listeners, and cleanup branches', () => {
    const target = document.createElement('div');
    const appliedThemes: string[] = [];
    const listenerCalls: string[] = [];

    const originalMatchMedia = window.matchMedia;
    const listeners: Array<() => void> = [];

    window.matchMedia = (() => ({
      matches: true,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addEventListener: undefined,
      removeEventListener: undefined,
      addListener: (handler: () => void) => listeners.push(handler),
      removeListener: () => undefined,
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;

    const bridge = new DaisyThemeBridge({
      target,
      themes,
      defaultSemanticTheme: 'playful',
      defaultMode: 'system',
      onApplyTheme: ({ daisyTheme }) => {
        appliedThemes.push(daisyTheme);
      },
    });

    const unsubscribe = bridge.onChange(() => {
      listenerCalls.push(`${bridge.getSemanticTheme()}:${bridge.getMode()}`);
    });

    expect(bridge.resolveMode()).toBe('dark');
    expect(appliedThemes).toContain('cupcake');

    bridge.setMode('system');
    listeners[0]?.();
    expect(listenerCalls.length).toBeGreaterThan(0);

    unsubscribe();
    bridge.setSemanticTheme('light');
    expect(target.getAttribute('data-theme-mode')).toBe('light');

    window.matchMedia = originalMatchMedia;
  });

  it('handles invalid configuration and localStorage failures', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const bridge = new DaisyThemeBridge({
      target: document.documentElement,
      themes,
      defaultSemanticTheme: 'light',
    });

    bridge.setMode('dark');
    bridge.setSemanticTheme('playful');

    expect(warnSpy).toHaveBeenCalled();
    expect(() => bridge.getThemeConfig('missing-theme')).not.toThrow();

    expect(() => new DaisyThemeBridge({
      target: document.documentElement,
      themes: {},
      defaultSemanticTheme: 'missing-theme',
    })).toThrow();

    setItemSpy.mockRestore();
    getItemSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('renders without mode controls and supports destroy', () => {
    const bridge = new DaisyThemeBridge({
      target: document.documentElement,
      themes,
      defaultSemanticTheme: 'light',
    });

    const container = document.createElement('div');
    document.body.appendChild(container);

    const switcher = new ThemeSwitcher({
      container,
      bridge,
      showModeControls: false,
    });

    expect(container.querySelector('[data-theme-mode]')).toBeNull();

    switcher.destroy();
  });
});
