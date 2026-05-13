import { vi } from 'vitest';

/**
 * 测试环境全局设置
 * 
 * 此文件在所有测试运行前执行，用于：
 * - Mock 浏览器 API
 * - 配置全局测试环境
 * - 提供测试工具函数
 */

// ============================================
// Mock localStorage
// ============================================

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

// ============================================
// Mock matchMedia
// ============================================

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // 已废弃
    removeListener: vi.fn(), // 已废弃
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// ============================================
// Mock IntersectionObserver
// ============================================

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

// ============================================
// Mock ResizeObserver
// ============================================

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

// ============================================
// Mock requestAnimationFrame
// ============================================

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

// ============================================
// Mock window.getComputedStyle
// ============================================

Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => ''
  })
});

// ============================================
// 测试工具函数
// ============================================

/**
 * 等待下一个微任务
 */
export const nextTick = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * 等待指定时间
 */
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 触发媒体查询变化
 */
export const triggerMediaQueryChange = (matches: boolean) => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  (mediaQuery as any).matches = matches;
  if (mediaQuery.onchange) {
    mediaQuery.onchange(new Event('change') as MediaQueryListEvent);
  }
};

/**
 * 清理 DOM
 */
export const cleanupDOM = () => {
  document.body.innerHTML = '';
  document.head.innerHTML = '';
};

// ============================================
// 全局测试钩子
// ============================================

// 每个测试前清理
beforeEach(() => {
  // 清理 localStorage
  localStorage.clear();
  
  // 清理 DOM
  cleanupDOM();
  
  // 重置所有 mock
  vi.clearAllMocks();
});

// 每个测试后清理
afterEach(() => {
  // 清理定时器
  vi.clearAllTimers();
});
