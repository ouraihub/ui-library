import type { LazyLoadOptions, LazyLoadState, LoadStatus } from './types';

export class LazyLoader {
  private observer: IntersectionObserver | null = null;
  private elements = new Map<HTMLElement, LazyLoadState>();
  private options: Required<LazyLoadOptions>;

  constructor(options: LazyLoadOptions = {}) {
    this.options = {
      root: options.root ?? null,
      rootMargin: options.rootMargin ?? '0px',
      threshold: options.threshold ?? 0,
      placeholderClass: options.placeholderClass ?? 'lazy-placeholder',
      loadingClass: options.loadingClass ?? 'lazy-loading',
      loadedClass: options.loadedClass ?? 'lazy-loaded',
      errorClass: options.errorClass ?? 'lazy-error',
      retryCount: options.retryCount ?? 2,
      retryDelay: options.retryDelay ?? 1000,
      fadeInDuration: options.fadeInDuration ?? 300,
      onEnter: options.onEnter ?? (() => {}),
      onLoad: options.onLoad ?? (() => {}),
      onError: options.onError ?? (() => {}),
    };

    this.init();
  }

  private init(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      console.warn('[LazyLoader] IntersectionObserver not supported');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            this.handleIntersection(element);
          }
        });
      },
      {
        root: this.options.root,
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold,
      }
    );
  }

  private handleIntersection(element: HTMLElement): void {
    const state = this.elements.get(element);
    if (!state || state.status !== 'idle') return;

    this.options.onEnter(element);
    this.load(element);
  }

  private async load(element: HTMLElement): Promise<void> {
    const state = this.elements.get(element);
    if (!state) return;

    this.updateState(element, 'loading');
    element.classList.remove(this.options.placeholderClass);
    element.classList.add(this.options.loadingClass);

    try {
      if (element.tagName === 'IMG') {
        await this.loadImage(element as HTMLImageElement);
      } else if (element.tagName === 'PICTURE') {
        await this.loadPicture(element);
      } else if (element.hasAttribute('data-bg')) {
        await this.loadBackgroundImage(element);
      } else {
        await this.loadContent(element);
      }

      this.handleLoadSuccess(element);
    } catch (error) {
      this.handleLoadError(element, error as Error);
    }
  }

  private loadImage(img: HTMLImageElement): Promise<void> {
    return new Promise((resolve, reject) => {
      const src = img.getAttribute('data-src');
      const srcset = img.getAttribute('data-srcset');

      if (!src && !srcset) {
        reject(new Error('No data-src or data-srcset attribute'));
        return;
      }

      const tempImg = new Image();

      tempImg.onload = () => {
        if (src) img.src = src;
        if (srcset) img.srcset = srcset;
        img.removeAttribute('data-src');
        img.removeAttribute('data-srcset');
        resolve();
      };

      tempImg.onerror = () => {
        reject(new Error(`Failed to load image: ${src || srcset}`));
      };

      if (srcset) {
        tempImg.srcset = srcset;
      } else if (src) {
        tempImg.src = src;
      }
    });
  }

  private loadPicture(picture: HTMLElement): Promise<void> {
    const img = picture.querySelector('img');
    if (!img) {
      return Promise.reject(new Error('No img element in picture'));
    }

    const sources = picture.querySelectorAll('source');
    sources.forEach((source) => {
      const srcset = source.getAttribute('data-srcset');
      if (srcset) {
        source.srcset = srcset;
        source.removeAttribute('data-srcset');
      }
    });

    return this.loadImage(img);
  }

  private loadBackgroundImage(element: HTMLElement): Promise<void> {
    return new Promise((resolve, reject) => {
      const bg = element.getAttribute('data-bg');
      if (!bg) {
        reject(new Error('No data-bg attribute'));
        return;
      }

      const tempImg = new Image();

      tempImg.onload = () => {
        element.style.backgroundImage = `url(${bg})`;
        element.removeAttribute('data-bg');
        resolve();
      };

      tempImg.onerror = () => {
        reject(new Error(`Failed to load background image: ${bg}`));
      };

      tempImg.src = bg;
    });
  }

  private loadContent(element: HTMLElement): Promise<void> {
    return new Promise((resolve, reject) => {
      const content = element.getAttribute('data-content');
      if (!content) {
        reject(new Error('No data-content attribute'));
        return;
      }

      try {
        element.innerHTML = content;
        element.removeAttribute('data-content');
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleLoadSuccess(element: HTMLElement): void {
    this.updateState(element, 'loaded');
    element.classList.remove(this.options.loadingClass);
    element.classList.add(this.options.loadedClass);

    if (this.options.fadeInDuration > 0) {
      element.style.transition = `opacity ${this.options.fadeInDuration}ms`;
      element.style.opacity = '0';
      requestAnimationFrame(() => {
        element.style.opacity = '1';
      });
    }

    this.options.onLoad(element);
    this.unobserve(element);
  }

  private async handleLoadError(element: HTMLElement, error: Error): Promise<void> {
    const state = this.elements.get(element);
    if (!state) return;

    if (state.retries < this.options.retryCount) {
      state.retries++;
      await this.delay(this.options.retryDelay);
      this.load(element);
      return;
    }

    this.updateState(element, 'error', error);
    element.classList.remove(this.options.loadingClass);
    element.classList.add(this.options.errorClass);

    this.options.onError(element, error);
    this.unobserve(element);
  }

  private updateState(element: HTMLElement, status: LoadStatus, error?: Error): void {
    const state = this.elements.get(element);
    if (state) {
      state.status = status;
      if (error) state.error = error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public observe(element: HTMLElement | string): void {
    const el = typeof element === 'string' 
      ? document.querySelector<HTMLElement>(element)
      : element;

    if (!el) {
      console.warn('[LazyLoader] Element not found');
      return;
    }

    if (this.elements.has(el)) return;

    this.elements.set(el, {
      status: 'idle',
      retries: 0,
    });

    el.classList.add(this.options.placeholderClass);

    if (this.observer) {
      this.observer.observe(el);
    } else {
      this.load(el);
    }
  }

  public observeAll(selector: string): void {
    const elements = document.querySelectorAll<HTMLElement>(selector);
    elements.forEach((el) => this.observe(el));
  }

  public unobserve(element: HTMLElement): void {
    if (this.observer) {
      this.observer.unobserve(element);
    }
    this.elements.delete(element);
  }

  public disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.elements.clear();
  }

  public getState(element: HTMLElement): LazyLoadState | undefined {
    return this.elements.get(element);
  }
}
