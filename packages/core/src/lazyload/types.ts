/**
 * 加载状态类型
 */
export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * 懒加载选项
 */
export interface LazyLoadOptions {
  /**
   * IntersectionObserver 根元素
   * @default null (viewport)
   */
  root?: HTMLElement | null;

  /**
   * 根元素边距，用于提前加载
   * @default '0px'
   */
  rootMargin?: string;

  /**
   * 触发加载的可见度阈值 (0-1)
   * @default 0
   */
  threshold?: number | number[];

  /**
   * 占位符 CSS 类名
   * @default 'lazy-placeholder'
   */
  placeholderClass?: string;

  /**
   * 加载中 CSS 类名
   * @default 'lazy-loading'
   */
  loadingClass?: string;

  /**
   * 加载完成 CSS 类名
   * @default 'lazy-loaded'
   */
  loadedClass?: string;

  /**
   * 加载失败 CSS 类名
   * @default 'lazy-error'
   */
  errorClass?: string;

  /**
   * 加载失败后重试次数
   * @default 2
   */
  retryCount?: number;

  /**
   * 重试延迟（毫秒）
   * @default 1000
   */
  retryDelay?: number;

  /**
   * 淡入动画持续时间（毫秒）
   * @default 300
   */
  fadeInDuration?: number;

  /**
   * 元素进入视口时的回调
   */
  onEnter?: (element: HTMLElement) => void;

  /**
   * 加载成功时的回调
   */
  onLoad?: (element: HTMLElement) => void;

  /**
   * 加载失败时的回调
   */
  onError?: (element: HTMLElement, error: Error) => void;
}

/**
 * 懒加载状态
 */
export interface LazyLoadState {
  /**
   * 当前加载状态
   */
  status: LoadStatus;

  /**
   * 已重试次数
   */
  retries: number;

  /**
   * 错误信息（如果有）
   */
  error?: Error;
}
