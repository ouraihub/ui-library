import type { TOCOptions } from './types';

const DEFAULTS: Required<TOCOptions> = {
  contentSelector: 'article',
  headingSelector: 'h2, h3, h4',
  tocSelector: '.toc',
  activeClass: 'active',
  rootMargin: '0px 0px -70% 0px',
};

export class TOCHighlighter {
  private opts: Required<TOCOptions>;
  private observer: IntersectionObserver | null = null;

  constructor(options?: TOCOptions) {
    this.opts = { ...DEFAULTS, ...options };
  }

  init(): void {
    if (typeof window === 'undefined') return;

    const content = document.querySelector(this.opts.contentSelector);
    if (!content) return;

    const headings = content.querySelectorAll<HTMLElement>(this.opts.headingSelector);
    if (!headings.length) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.activate(entry.target.id);
          }
        }
      },
      { rootMargin: this.opts.rootMargin }
    );

    headings.forEach((h) => { if (h.id) this.observer!.observe(h); });
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  private activate(id: string): void {
    const toc = document.querySelector(this.opts.tocSelector);
    if (!toc) return;

    toc.querySelectorAll(`.${this.opts.activeClass}`).forEach((el) =>
      el.classList.remove(this.opts.activeClass)
    );

    const link = toc.querySelector(`a[href="#${id}"]`);
    link?.classList.add(this.opts.activeClass);
  }
}
