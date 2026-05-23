import type { CodeCopyOptions } from './types';

const DEFAULTS: Required<CodeCopyOptions> = {
  selector: 'pre',
  buttonLabel: 'Copy',
  copiedLabel: 'Copied!',
  copiedTimeout: 2000,
  buttonClass: 'code-copy-btn',
};

export class CodeCopyManager {
  private opts: Required<CodeCopyOptions>;
  private buttons: Map<HTMLElement, HTMLButtonElement> = new Map();

  constructor(options?: CodeCopyOptions) {
    this.opts = { ...DEFAULTS, ...options };
  }

  init(): void {
    if (typeof window === 'undefined') return;
    const blocks = document.querySelectorAll<HTMLElement>(this.opts.selector);
    blocks.forEach((block) => this.attach(block));
  }

  destroy(): void {
    this.buttons.forEach((btn, block) => {
      btn.remove();
      block.style.position = '';
    });
    this.buttons.clear();
  }

  private attach(block: HTMLElement): void {
    if (this.buttons.has(block)) return;

    block.style.position = 'relative';
    const btn = document.createElement('button');
    btn.textContent = this.opts.buttonLabel;
    btn.className = this.opts.buttonClass;
    btn.setAttribute('data-state', 'idle');
    btn.addEventListener('click', () => this.copy(block, btn));
    block.appendChild(btn);
    this.buttons.set(block, btn);
  }

  private async copy(block: HTMLElement, btn: HTMLButtonElement): Promise<void> {
    const code = block.querySelector('code')?.textContent || block.textContent || '';
    try {
      await navigator.clipboard.writeText(code.trim());
      btn.textContent = this.opts.copiedLabel;
      btn.setAttribute('data-state', 'copied');
      setTimeout(() => {
        btn.textContent = this.opts.buttonLabel;
        btn.setAttribute('data-state', 'idle');
      }, this.opts.copiedTimeout);
    } catch {
      // Fallback for older browsers
      btn.textContent = 'Error';
      btn.setAttribute('data-state', 'error');
    }
  }
}
