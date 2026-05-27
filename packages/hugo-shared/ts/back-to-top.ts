export interface BackToTopOptions {
  threshold?: number;
  smooth?: boolean;
  onShow?: () => void;
  onHide?: () => void;
}

const DEFAULTS: Required<BackToTopOptions> = {
  threshold: 0.3,
  smooth: true,
  onShow: () => {},
  onHide: () => {},
};

export class BackToTop {
  private visible = false;
  private raf: number | null = null;
  private handler: (() => void) | null = null;
  private opts: Required<BackToTopOptions>;

  constructor(options?: BackToTopOptions) {
    this.opts = { ...DEFAULTS, ...options };
  }

  init(): void {
    this.handler = () => {
      if (this.raf) return;
      this.raf = requestAnimationFrame(() => {
        this.update();
        this.raf = null;
      });
    };
    window.addEventListener('scroll', this.handler, { passive: true });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: this.opts.smooth ? 'smooth' : 'instant' });
  }

  private update(): void {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollHeight <= clientHeight) return;
    const shouldShow = scrollTop / (scrollHeight - clientHeight) >= this.opts.threshold;
    if (shouldShow && !this.visible) { this.visible = true; this.opts.onShow(); }
    if (!shouldShow && this.visible) { this.visible = false; this.opts.onHide(); }
  }
}
