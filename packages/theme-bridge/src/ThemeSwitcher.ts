import type {
  ThemeMode,
  ThemeSwitcherLabels,
  ThemeSwitcherOptions,
} from './types';

const DEFAULT_LABELS: Required<ThemeSwitcherLabels> = {
  semanticTitle: 'Themes',
  modeTitle: 'Mode',
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

export class ThemeSwitcher {
  private labels: Required<ThemeSwitcherLabels>;
  private unsubscribe: (() => void) | null = null;

  constructor(private options: ThemeSwitcherOptions) {
    this.labels = {
      ...DEFAULT_LABELS,
      ...options.labels,
    };

    this.render();
    this.unsubscribe = this.options.bridge.onChange(() => this.syncState());
  }

  public destroy(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  private render(): void {
    const { container, bridge, showModeControls = true } = this.options;
    const currentSemanticTheme = bridge.getSemanticTheme();
    const currentMode = bridge.getMode();

    container.innerHTML = '';
    container.appendChild(this.createStyle());

    const root = document.createElement('div');
    root.className = 'ui-theme-switcher';

    root.appendChild(this.createSemanticSection(currentSemanticTheme));

    if (showModeControls) {
      root.appendChild(this.createModeSection(currentMode));
    }

    container.appendChild(root);
    this.bindEvents();
    this.syncState();
  }

  private createStyle(): HTMLStyleElement {
    const style = document.createElement('style');
    style.textContent = `
      .ui-theme-switcher {
        display: grid;
        gap: 16px;
        font-family: Inter, "Segoe UI", Arial, sans-serif;
      }
      .ui-theme-switcher__section {
        display: grid;
        gap: 10px;
      }
      .ui-theme-switcher__title {
        font-size: 14px;
        font-weight: 700;
        color: #1c2431;
      }
      .ui-theme-switcher__themes,
      .ui-theme-switcher__modes {
        display: grid;
        gap: 8px;
      }
      .ui-theme-switcher__theme {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        border: 1px solid #dbe3ef;
        border-radius: 12px;
        background: #fff;
        cursor: pointer;
        font: inherit;
      }
      .ui-theme-switcher__theme.is-active,
      .ui-theme-switcher__mode.is-active {
        border-color: #9ac1ff;
        background: #eaf3ff;
        color: #0f6fff;
      }
      .ui-theme-switcher__theme-name {
        display: block;
        font-weight: 600;
        color: #1c2431;
        margin-bottom: 4px;
      }
      .ui-theme-switcher__theme-desc {
        display: block;
        font-size: 13px;
        color: #5c6778;
      }
      .ui-theme-switcher__modes {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .ui-theme-switcher__mode {
        padding: 10px 12px;
        border: 1px solid #dbe3ef;
        border-radius: 12px;
        background: #fff;
        color: #5c6778;
        cursor: pointer;
        font: inherit;
      }
    `;
    return style;
  }

  private createSemanticSection(currentSemanticTheme: string): HTMLElement {
    const section = document.createElement('section');
    section.className = 'ui-theme-switcher__section';

    const title = document.createElement('div');
    title.className = 'ui-theme-switcher__title';
    title.textContent = this.labels.semanticTitle;
    section.appendChild(title);

    const list = document.createElement('div');
    list.className = 'ui-theme-switcher__themes';

    for (const [key, config] of Object.entries(this.options.bridge.themes)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ui-theme-switcher__theme';
      if (key === currentSemanticTheme) {
        button.classList.add('is-active');
      }
      button.dataset.semanticTheme = key;
      button.innerHTML = `
        <span>
          <span class="ui-theme-switcher__theme-name">${config.label}</span>
          <span class="ui-theme-switcher__theme-desc">${config.description || config.daisyTheme}</span>
        </span>
        <span>${config.daisyTheme}</span>
      `;
      list.appendChild(button);
    }

    section.appendChild(list);
    return section;
  }

  private createModeSection(currentMode: ThemeMode): HTMLElement {
    const section = document.createElement('section');
    section.className = 'ui-theme-switcher__section';

    const title = document.createElement('div');
    title.className = 'ui-theme-switcher__title';
    title.textContent = this.labels.modeTitle;
    section.appendChild(title);

    const modes = document.createElement('div');
    modes.className = 'ui-theme-switcher__modes';

    (['light', 'dark', 'system'] as ThemeMode[]).forEach((mode) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ui-theme-switcher__mode';
      if (mode === currentMode) {
        button.classList.add('is-active');
      }
      button.dataset.themeMode = mode;
      button.textContent = this.labels[mode];
      modes.appendChild(button);
    });

    section.appendChild(modes);
    return section;
  }

  private bindEvents(): void {
    const { container, bridge } = this.options;

    container.querySelectorAll<HTMLButtonElement>('[data-semantic-theme]').forEach((button) => {
      button.addEventListener('click', () => {
        const theme = button.dataset.semanticTheme;
        if (theme) {
          bridge.setSemanticTheme(theme);
          this.syncState();
        }
      });
    });

    container.querySelectorAll<HTMLButtonElement>('[data-theme-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        const mode = button.dataset.themeMode as ThemeMode | undefined;
        if (mode) {
          bridge.setMode(mode);
          this.syncState();
        }
      });
    });
  }

  private syncState(): void {
    const currentSemanticTheme = this.options.bridge.getSemanticTheme();
    const currentMode = this.options.bridge.getMode();

    this.options.container.querySelectorAll<HTMLElement>('[data-semantic-theme]').forEach((element) => {
      element.classList.toggle('is-active', element.dataset.semanticTheme === currentSemanticTheme);
    });

    this.options.container.querySelectorAll<HTMLElement>('[data-theme-mode]').forEach((element) => {
      element.classList.toggle('is-active', element.dataset.themeMode === currentMode);
    });
  }
}
