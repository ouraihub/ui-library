import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LazyLoader } from '../../src/lazyload/LazyLoader';

describe('LazyLoader', () => {
  let loader: LazyLoader;
  let mockIntersectionObserver: any;
  let intersectionCallback: IntersectionObserverCallback;

  beforeEach(() => {
    mockIntersectionObserver = vi.fn((callback: IntersectionObserverCallback) => {
      intersectionCallback = callback;
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };
    });

    global.IntersectionObserver = mockIntersectionObserver as any;
    
    (global.Image as any) = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';
      srcset = '';
      
      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    };
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (loader) {
      loader.disconnect();
    }
    document.body.innerHTML = '';
  });

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      loader = new LazyLoader();
      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        {
          root: null,
          rootMargin: '0px',
          threshold: 0,
        }
      );
    });

    it('should accept custom root', () => {
      const root = document.createElement('div');
      loader = new LazyLoader({ root });
      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ root })
      );
    });

    it('should accept custom rootMargin', () => {
      loader = new LazyLoader({ rootMargin: '50px' });
      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ rootMargin: '50px' })
      );
    });

    it('should accept custom threshold', () => {
      loader = new LazyLoader({ threshold: 0.5 });
      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ threshold: 0.5 })
      );
    });

    it('should accept custom CSS classes', () => {
      loader = new LazyLoader({
        placeholderClass: 'custom-placeholder',
        loadingClass: 'custom-loading',
        loadedClass: 'custom-loaded',
        errorClass: 'custom-error',
      });

      const img = document.createElement('img');
      img.setAttribute('data-src', 'test.jpg');
      document.body.appendChild(img);

      loader.observe(img);
      expect(img.classList.contains('custom-placeholder')).toBe(true);
    });

    it('should initialize without IntersectionObserver', () => {
      loader = new LazyLoader();
      expect(loader).toBeDefined();
    });
  });

  describe('Image Loading', () => {
    beforeEach(() => {
      loader = new LazyLoader();
    });

    it('should load image with data-src', async () => {
      const img = document.createElement('img');
      img.setAttribute('data-src', 'test.jpg');
      document.body.appendChild(img);

      loader.observe(img);

      const entries: IntersectionObserverEntry[] = [{
        target: img,
        isIntersecting: true,
      } as IntersectionObserverEntry];

      intersectionCallback(entries, {} as IntersectionObserver);

      await vi.waitFor(() => {
        expect(img.src).toContain('test.jpg');
        expect(img.hasAttribute('data-src')).toBe(false);
      });
    });

    it('should load image with data-srcset', async () => {
      const img = document.createElement('img');
      img.setAttribute('data-srcset', 'test-320.jpg 320w, test-640.jpg 640w');
      document.body.appendChild(img);

      loader.observe(img);

      const entries: IntersectionObserverEntry[] = [{
        target: img,
        isIntersecting: true,
      } as IntersectionObserverEntry];

      intersectionCallback(entries, {} as IntersectionObserver);

      await vi.waitFor(() => {
        expect(img.srcset).toContain('test-320.jpg');
        expect(img.hasAttribute('data-srcset')).toBe(false);
      });
    });

    it('should load image with both data-src and data-srcset', async () => {
      const img = document.createElement('img');
      img.setAttribute('data-src', 'test.jpg');
      img.setAttribute('data-srcset', 'test-320.jpg 320w');
      document.body.appendChild(img);

      loader.observe(img);

      const entries: IntersectionObserverEntry[] = [{
        target: img,
        isIntersecting: true,
      } as IntersectionObserverEntry];

      intersectionCallback(entries, {} as IntersectionObserver);

      await vi.waitFor(() => {
        expect(img.src).toContain('test.jpg');
        expect(img.srcset).toContain('test-320.jpg');
      });
    });

    it('should add loading and loaded classes', async () => {
      const img = document.createElement('img');
      img.setAttribute('data-src', 'test.jpg');
      document.body.appendChild(img);

      loader.observe(img);
      expect(img.classList.contains('lazy-placeholder')).toBe(true);

      const entries: IntersectionObserverEntry[] = [{
        target: img,
        isIntersecting: true,
      } as IntersectionObserverEntry];

      intersectionCallback(entries, {} as IntersectionObserver);

      await vi.waitFor(() => {
        expect(img.classList.contains('lazy-placeholder')).toBe(false);
        expect(img.classList.contains('lazy-loaded')).toBe(true);
      });
    });

    it('should apply fade-in effect', async () => {
      loader = new LazyLoader({ fadeInDuration: 300 });

      const img = document.createElement('img');
      img.setAttribute('data-src', 'test.jpg');
      document.body.appendChild(img);

      loader.observe(img);

      const entries: IntersectionObserverEntry[] = [{
        target: img,
        isIntersecting: true,
      } as IntersectionObserverEntry];

      intersectionCallback(entries, {} as IntersectionObserver);

      await vi.waitFor(() => {
        expect(img.style.transition).toContain('opacity');
        expect(img.style.opacity).toBe('1');
      });
    });

    it('should not load when not intersecting', () => {
      const img = document.createElement('img');
      img.setAttribute('data-src', 'test.jpg');
      document.body.appendChild(img);

      loader.observe(img);

      const entries: IntersectionObserverEntry[] = [{
        target: img,
        isIntersecting: false,
      } as IntersectionObserverEntry];

      intersectionCallback(entries, {} as IntersectionObserver);

      expect(img.src).toBe('');
    });
  });

  describe('Picture Loading', () => {
    beforeEach(() => {
      loader = new LazyLoader();
    });

    it('should load picture element', async () => {
      const picture = document.createElement('picture');
      const source = document.createElement('source');
      source.setAttribute('data-srcset', 'test-webp.webp');
      source.setAttribute('type', 'image/webp');
      const img = document.createElement('img');
      img.setAttribute('data-src', 'test.jpg');
      picture.appendChild(source);
      picture.appendChild(img);
      document.body.appendChild(picture);

      loader.observe(picture);

      const entries: IntersectionObserverEntry[] = [{
        target: picture,
        isIntersecting: true,
      } as IntersectionObserverEntry];

      intersectionCallback(entries, {} as IntersectionObserver);

      await vi.waitFor(() => {
        expect(source.srcset).toContain('test-webp.webp');
        expect(img.src).toContain('test.jpg');
      });
    });

    it('should handle picture without img', async () => {
      (global.Image as any) = class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        srcset = '';
        
        constructor() {
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 0);
        }
      };
      
      loader = new LazyLoader({ retryCount: 0 });
      
      const picture = document.createElement('picture');
      document.body.appendChild(picture);

      loader.observe(picture);

      const entries: IntersectionObserverEntry[] = [{
        target: picture,
        isIntersecting: true,
      } as IntersectionObserverEntry];

      intersectionCallback(entries, {} as IntersectionObserver);

      await vi.waitFor(() => {
        expect(picture.classList.contains('lazy-error')).toBe(true);
      });
    });
  });

  describe('Background Image Loading', () => {
    beforeEach(() => {
      loader = new LazyLoader();
    });

    it('should load background image', async () => {
      const div = document.createElement('div');
      div.setAttribute('data-bg', 'bg.jpg');
      document.body.appendChild(div);

      loader.observe(div);

      const entries: IntersectionObserverEntry[] = [{
        target: div,
        isIntersecting: true,
      } as IntersectionObserverEntry];

      intersectionCallback(entries, {} as IntersectionObserver);

      await vi.waitFor(() => {
        expect(div.style.backgroundImage).toContain('bg.jpg');
        expect(div.hasAttribute('data-bg')).toBe(false);
      });
    });
  });

  describe('Content Loading', () => {
    beforeEach(() => {
      loader = new LazyLoader();
    });

    it('should load content from data-content', async () => {
      const div = document.createElement('div');
      div.setAttribute('data-content', '<p>Lazy content</p>');
      document.body.appendChild(div);

      loader.observe(div);

      const entries: IntersectionObserverEntry[] = [{
        target: div,
        isIntersecting: true,
      } as IntersectionObserverEntry];

      intersectionCallback(entries, {} as IntersectionObserver);

      await vi.waitFor(() => {
        expect(div.innerHTML).toBe('<p>Lazy content</p>');
        expect(div.hasAttribute('data-content')).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      (global.Image as any) = class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        srcset = '';
        
        constructor() {
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 0);
        }
      };
      
      loader = new LazyLoader({ retryCount: 2, retryDelay: 100 });
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      (global.Image as any) = class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        srcset = '';
        
        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      };
    });

    it('should add error class on load failure', async () => {
      const img = document.createElement('img');
      img.setAttribute('data-src', 'invalid.jpg');
      document.body.appendChild(img);

      loader.observe(img);

      const entries: IntersectionObserverEntry[] = [{
        target: img,
        isIntersecting: true,
      } as IntersectionObserverEntry];

      intersectionCallback(entries, {} as IntersectionObserver);

      await vi.advanceTimersByTimeAsync(500);

      expect(img.classList.contains('lazy-error')).toBe(true);
    });

    it('should retry on load failure', async () => {
      const img = document.createElement('img');
      img.setAttribute('data-src', 'invalid.jpg');
      document.body.appendChild(img);

      loader.observe(img);

      const entries: IntersectionObserverEntry[] = [{
        target: img,
        isIntersecting: true,
      } as IntersectionObserverEntry];

      intersectionCallback(entries, {} as IntersectionObserver);

      await vi.advanceTimersByTimeAsync(150);

      const state2 = loader.getState(img);
      expect(state2?.retries).toBeGreaterThan(0);
    });

    it('should call onError callback', async () => {
      const onError = vi.fn();
      loader = new LazyLoader({ retryCount: 0, onError });

      const img = document.createElement('img');
      img.setAttribute('data-src', 'invalid.jpg');
      document.body.appendChild(img);

      loader.observe(img);

      const entries: IntersectionObserverEntry[] = [{
        target: img,
        isIntersecting: true,
      } as IntersectionObserverEntry];

      intersectionCallback(entries, {} as IntersectionObserver);

      await vi.advanceTimersByTimeAsync(100);

      expect(onError).toHaveBeenCalledWith(img, expect.any(Error));
    });

    it('should handle missing data attributes', async () => {
      const img = document.createElement('img');
      document.body.appendChild(img);

      loader.observe(img);

      const entries: IntersectionObserverEntry[] = [{
        target: img,
        isIntersecting: true,
      } as IntersectionObserverEntry];

      intersectionCallback(entries, {} as IntersectionObserver);

      await vi.waitFor(() => {
        expect(img.classList.contains('lazy-error')).toBe(true);
      });
    });
  });

  describe('Event Callbacks', () => {
    it('should call onEnter when element enters viewport', () => {
      const onEnter = vi.fn();
      loader = new LazyLoader({ onEnter });

      const img = document.createElement('img');
      img.setAttribute('data-src', 'test.jpg');
      document.body.appendChild(img);

      loader.observe(img);

      const entries: IntersectionObserverEntry[] = [{
        target: img,
        isIntersecting: true,
      } as IntersectionObserverEntry];

      intersectionCallback(entries, {} as IntersectionObserver);

      expect(onEnter).toHaveBeenCalledWith(img);
    });

    it('should call onLoad when element loads successfully', async () => {
      const onLoad = vi.fn();
      loader = new LazyLoader({ onLoad });

      const img = document.createElement('img');
      img.setAttribute('data-src', 'test.jpg');
      document.body.appendChild(img);

      loader.observe(img);

      const entries: IntersectionObserverEntry[] = [{
        target: img,
        isIntersecting: true,
      } as IntersectionObserverEntry];

      intersectionCallback(entries, {} as IntersectionObserver);

      await vi.waitFor(() => {
        expect(onLoad).toHaveBeenCalledWith(img);
      });
    });
  });

  describe('observe() and observeAll()', () => {
    beforeEach(() => {
      loader = new LazyLoader();
    });

    it('should observe element by reference', () => {
      const img = document.createElement('img');
      img.setAttribute('data-src', 'test.jpg');
      document.body.appendChild(img);

      loader.observe(img);

      const state = loader.getState(img);
      expect(state).toBeDefined();
      expect(state?.status).toBe('idle');
    });

    it('should observe element by selector', () => {
      const img = document.createElement('img');
      img.setAttribute('data-src', 'test.jpg');
      img.id = 'test-img';
      document.body.appendChild(img);

      loader.observe('#test-img');

      const state = loader.getState(img);
      expect(state).toBeDefined();
    });

    it('should warn when element not found', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      loader.observe('#non-existent');
      expect(consoleSpy).toHaveBeenCalledWith('[LazyLoader] Element not found');
      consoleSpy.mockRestore();
    });

    it('should not observe same element twice', () => {
      const img = document.createElement('img');
      img.setAttribute('data-src', 'test.jpg');
      document.body.appendChild(img);

      loader.observe(img);
      loader.observe(img);

      const state = loader.getState(img);
      expect(state?.retries).toBe(0);
    });

    it('should observe all elements matching selector', () => {
      const img1 = document.createElement('img');
      img1.className = 'lazy';
      img1.setAttribute('data-src', 'test1.jpg');
      const img2 = document.createElement('img');
      img2.className = 'lazy';
      img2.setAttribute('data-src', 'test2.jpg');
      document.body.appendChild(img1);
      document.body.appendChild(img2);

      loader.observeAll('.lazy');

      expect(loader.getState(img1)).toBeDefined();
      expect(loader.getState(img2)).toBeDefined();
    });

    it('should handle observe when element already observed', () => {
      const img = document.createElement('img');
      img.setAttribute('data-src', 'test.jpg');
      document.body.appendChild(img);

      loader.observe(img);
      loader.observe(img);

      const state = loader.getState(img);
      expect(state).toBeDefined();
      expect(state?.status).toBe('idle');
    });
  });

  describe('unobserve()', () => {
    beforeEach(() => {
      loader = new LazyLoader();
    });

    it('should unobserve element', () => {
      const img = document.createElement('img');
      img.setAttribute('data-src', 'test.jpg');
      document.body.appendChild(img);

      loader.observe(img);
      expect(loader.getState(img)).toBeDefined();

      loader.unobserve(img);
      expect(loader.getState(img)).toBeUndefined();
    });
  });

  describe('disconnect()', () => {
    beforeEach(() => {
      loader = new LazyLoader();
    });

    it('should disconnect observer and clear all elements', () => {
      const img1 = document.createElement('img');
      img1.setAttribute('data-src', 'test1.jpg');
      const img2 = document.createElement('img');
      img2.setAttribute('data-src', 'test2.jpg');
      document.body.appendChild(img1);
      document.body.appendChild(img2);

      loader.observe(img1);
      loader.observe(img2);

      loader.disconnect();

      expect(loader.getState(img1)).toBeUndefined();
      expect(loader.getState(img2)).toBeUndefined();
    });
  });

  describe('getState()', () => {
    beforeEach(() => {
      loader = new LazyLoader();
    });

    it('should return element state', () => {
      const img = document.createElement('img');
      img.setAttribute('data-src', 'test.jpg');
      document.body.appendChild(img);

      loader.observe(img);

      const state = loader.getState(img);
      expect(state).toEqual({
        status: 'idle',
        retries: 0,
      });
    });

    it('should return undefined for unobserved element', () => {
      const img = document.createElement('img');
      const state = loader.getState(img);
      expect(state).toBeUndefined();
    });

    it('should track loading state', async () => {
      const img = document.createElement('img');
      img.setAttribute('data-src', 'test.jpg');
      document.body.appendChild(img);

      loader.observe(img);

      const entries: IntersectionObserverEntry[] = [{
        target: img,
        isIntersecting: true,
      } as IntersectionObserverEntry];

      intersectionCallback(entries, {} as IntersectionObserver);

      const state = loader.getState(img);
      expect(state?.status).toBe('loading');
    });
  });
});
