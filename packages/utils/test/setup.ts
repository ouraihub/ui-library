import { vi } from 'vitest';

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

class IntersectionObserverMock {
  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit
  ) {}

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  value: IntersectionObserverMock
});

class ResizeObserverMock {
  constructor(public callback: ResizeObserverCallback) {}

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(global, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverMock
});

Object.defineProperty(global, 'requestAnimationFrame', {
  writable: true,
  value: (callback: FrameRequestCallback) => {
    return setTimeout(() => callback(Date.now()), 0);
  }
});

Object.defineProperty(global, 'cancelAnimationFrame', {
  writable: true,
  value: (id: number) => {
    clearTimeout(id);
  }
});

Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => ''
  })
});

export const nextTick = () => new Promise(resolve => setTimeout(resolve, 0));

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const triggerMediaQueryChange = (matches: boolean) => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  (mediaQuery as any).matches = matches;
  if (mediaQuery.onchange) {
    mediaQuery.onchange(new Event('change') as MediaQueryListEvent);
  }
};

export const cleanupDOM = () => {
  document.body.innerHTML = '';
  document.head.innerHTML = '';
};

beforeEach(() => {
  localStorage.clear();
  cleanupDOM();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllTimers();
});
