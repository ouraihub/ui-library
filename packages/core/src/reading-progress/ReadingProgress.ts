import type { ReadingProgressOptions } from './types';

export class ReadingProgress {
  private opts: Required<ReadingProgressOptions>;
  private handler: (() => void) | null = null;

  constructor(options?: ReadingProgressOptions) {
    this.opts = {
      contentSelector: options?.contentSelector || 'article',
      onProgress: options?.onProgress || (() => {}),
    };
  }

  init(): void {
    if (typeof window === 'undefined') return;
    this.handler = () => this.update();
    window.addEventListener('scroll', this.handler, { passive: true });
    this.update();
  }

  destroy(): void {
    if (this.handler) window.removeEventListener('scroll', this.handler);
    this.handler = null;
  }

  private update(): void {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollHeight <= clientHeight) { this.opts.onProgress(0); return; }
    const percent = Math.min(scrollTop / (scrollHeight - clientHeight), 1);
    this.opts.onProgress(percent);
  }
}
