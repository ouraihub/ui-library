export interface ReadingProgressOptions {
  onProgress: (percent: number) => void;
}

export class ReadingProgress {
  private handler: (() => void) | null = null;
  private opts: ReadingProgressOptions;

  constructor(options: ReadingProgressOptions) {
    this.opts = options;
  }

  init(): void {
    this.handler = () => this.update();
    window.addEventListener('scroll', this.handler, { passive: true });
    this.update();
  }

  private update(): void {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollHeight <= clientHeight) { this.opts.onProgress(0); return; }
    this.opts.onProgress(Math.min(scrollTop / (scrollHeight - clientHeight), 1));
  }
}
