export interface CodeCopyOptions {
  selector?: string;
  buttonLabel?: string;
  copiedLabel?: string;
  copiedTimeout?: number;
  buttonClass?: string;
}

const DEFAULTS: Required<CodeCopyOptions> = {
  selector: 'pre',
  buttonLabel: 'Copy',
  copiedLabel: 'Copied!',
  copiedTimeout: 2000,
  buttonClass: 'code-copy-btn',
};

export class CodeCopyManager {
  private buttons = new Map<Element, HTMLButtonElement>();
  private opts: Required<CodeCopyOptions>;

  constructor(options?: CodeCopyOptions) {
    this.opts = { ...DEFAULTS, ...options };
  }

  init(): void {
    const blocks = document.querySelectorAll(this.opts.selector);
    blocks.forEach((block) => this.attach(block));
  }

  private attach(block: Element): void {
    if (this.buttons.has(block)) return;
    (block as HTMLElement).style.position = 'relative';
    const btn = document.createElement('button');
    btn.textContent = this.opts.buttonLabel;
    btn.className = this.opts.buttonClass;
    btn.addEventListener('click', () => this.copy(block, btn));
    block.appendChild(btn);
    this.buttons.set(block, btn);
  }

  private async copy(block: Element, btn: HTMLButtonElement): Promise<void> {
    const code = block.querySelector('code')?.textContent || block.textContent || '';
    try {
      await navigator.clipboard.writeText(code.trim());
      btn.textContent = this.opts.copiedLabel;
      setTimeout(() => { btn.textContent = this.opts.buttonLabel; }, this.opts.copiedTimeout);
    } catch {
      btn.textContent = 'Error';
    }
  }
}
