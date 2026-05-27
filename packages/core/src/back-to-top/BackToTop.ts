import type { BackToTopOptions } from './types';

const DEFAULTS: Required<BackToTopOptions> = {
  threshold: 0.3,
  smooth: true,
  onShow: () => {},
  onHide: () => {},
};

export class BackToTop {
  private opts: Required<BackToTopOptions>;
  private visible = false;
  private raf: number | null = null;
  private handler: (() => void) | null = null;

  constructor(options?: BackToTopOptions) {
    this.opts = { ...DEFAULTS, ...options };
  }

  init(): void {
    if (typeof window === 'undefined') return;
    this.handler = () => {
      if (this.raf) return;
      this.raf = requestAnimationFrame(() => {
        this.update();
        this.raf = null;
      });
    };
    window.addEventListener('scroll', this.handler, { passive: true });
  }

  destroy(): void {
    if (this.handler) window.removeEventListener('scroll', this.handler);
    if (this.raf) cancelAnimationFrame(this.raf);
    this.handler = null;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: this.opts.smooth ? 'smooth' : 'instant' });
  }

  getScrollPercent(): number {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollHeight <= clientHeight) return 0;
    return scrollTop / (scrollHeight - clientHeight);
  }

  private update(): void {
    const percent = this.getScrollPercent();
    const shouldShow = percent >= this.opts.threshold;
    if (shouldShow && !this.visible) { this.visible = true; this.opts.onShow(); }
    if (!shouldShow && this.visible) { this.visible = false; this.opts.onHide(); }
  }
}
