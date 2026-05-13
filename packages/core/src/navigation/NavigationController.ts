import type { NavigationOptions, NavigationState, ScrollDirection } from './types';

/**
 * NavigationController - 导航菜单控制器
 * 
 * 功能：
 * - 移动端菜单切换（body 滚动锁定）
 * - 多级下拉菜单（点击外部关闭）
 * - 滚动时隐藏/显示导航栏
 * - 响应式断点自动切换
 * 
 * @example
 * ```typescript
 * const nav = new NavigationController(document.querySelector('nav'), {
 *   mobileBreakpoint: 768,
 *   hideOnScroll: true,
 *   scrollThreshold: 100
 * });
 * 
 * nav.onMenuToggle((isOpen) => {
 *   console.log('Mobile menu:', isOpen ? 'open' : 'closed');
 * });
 * ```
 */
export class NavigationController {
  private element: HTMLElement;
  private mobileBreakpoint: number;
  private hideOnScroll: boolean;
  private scrollThreshold: number;
  private mobileMenuClass: string;
  private dropdownActiveClass: string;
  private hiddenClass: string;
  private bodyLockClass: string;
  
  private state: NavigationState = {
    isMobileMenuOpen: false,
    activeDropdown: null,
    isHidden: false,
    isMobile: false,
    lastScrollY: 0,
    scrollDirection: 'none'
  };
  
  private menuToggleListeners: Array<(isOpen: boolean) => void> = [];
  private dropdownToggleListeners: Array<(dropdownId: string | null) => void> = [];
  private scrollListeners: Array<(state: { isHidden: boolean; direction: ScrollDirection }) => void> = [];
  
  private resizeObserver: ResizeObserver | null = null;
  private boundHandleScroll: (() => void) | null = null;
  private boundHandleResize: (() => void) | null = null;
  private boundHandleClickOutside: ((e: MouseEvent) => void) | null = null;

  constructor(element: HTMLElement, options: NavigationOptions = {}) {
    if (typeof window === 'undefined') {
      throw new Error('[NavigationController] Cannot initialize in non-browser environment');
    }
    
    if (!element) {
      throw new Error('[NavigationController] Navigation element is required');
    }
    
    this.element = element;
    this.mobileBreakpoint = options.mobileBreakpoint ?? 768;
    this.hideOnScroll = options.hideOnScroll ?? false;
    this.scrollThreshold = options.scrollThreshold ?? 100;
    this.mobileMenuClass = options.mobileMenuClass ?? 'mobile-menu-open';
    this.dropdownActiveClass = options.dropdownActiveClass ?? 'dropdown-active';
    this.hiddenClass = options.hiddenClass ?? 'nav-hidden';
    this.bodyLockClass = options.bodyLockClass ?? 'scroll-lock';
    
    this.init();
  }

  private init(): void {
    this.checkMobileMode();
    this.setupEventListeners();
    
    if (this.hideOnScroll) {
      this.state.lastScrollY = window.scrollY;
    }
  }

  private setupEventListeners(): void {
    this.boundHandleScroll = this.handleScroll.bind(this);
    this.boundHandleResize = this.handleResize.bind(this);
    this.boundHandleClickOutside = this.handleClickOutside.bind(this);
    
    if (this.hideOnScroll) {
      window.addEventListener('scroll', this.boundHandleScroll, { passive: true });
    }
    
    window.addEventListener('resize', this.boundHandleResize);
    document.addEventListener('click', this.boundHandleClickOutside);
  }

  private handleScroll(): void {
    if (!this.hideOnScroll) return;
    
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - this.state.lastScrollY;
    
    if (Math.abs(delta) < 5) return;
    
    const newDirection: ScrollDirection = delta > 0 ? 'down' : 'up';
    const shouldHide = currentScrollY > this.scrollThreshold && newDirection === 'down';
    
    if (this.state.isHidden !== shouldHide || this.state.scrollDirection !== newDirection) {
      this.state.isHidden = shouldHide;
      this.state.scrollDirection = newDirection;
      
      if (shouldHide) {
        this.element.classList.add(this.hiddenClass);
      } else {
        this.element.classList.remove(this.hiddenClass);
      }
      
      this.notifyScrollListeners();
    }
    
    this.state.lastScrollY = currentScrollY;
  }

  private handleResize(): void {
    this.checkMobileMode();
    
    if (!this.state.isMobile && this.state.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  private handleClickOutside(e: MouseEvent): void {
    if (!this.state.activeDropdown) return;
    
    const target = e.target as Node;
    const dropdownElement = document.querySelector(`[data-dropdown="${this.state.activeDropdown}"]`);
    
    if (dropdownElement && !dropdownElement.contains(target)) {
      this.closeDropdown();
    }
  }

  private checkMobileMode(): void {
    const wasMobile = this.state.isMobile;
    this.state.isMobile = window.innerWidth < this.mobileBreakpoint;
    
    if (wasMobile !== this.state.isMobile) {
      if (!this.state.isMobile) {
        this.closeMobileMenu();
      }
    }
  }

  private lockBodyScroll(): void {
    document.body.classList.add(this.bodyLockClass);
    document.body.style.overflow = 'hidden';
  }

  private unlockBodyScroll(): void {
    document.body.classList.remove(this.bodyLockClass);
    document.body.style.overflow = '';
  }

  private notifyMenuToggleListeners(): void {
    this.menuToggleListeners.forEach(fn => fn(this.state.isMobileMenuOpen));
  }

  private notifyDropdownToggleListeners(): void {
    this.dropdownToggleListeners.forEach(fn => fn(this.state.activeDropdown));
  }

  private notifyScrollListeners(): void {
    this.scrollListeners.forEach(fn => fn({
      isHidden: this.state.isHidden,
      direction: this.state.scrollDirection
    }));
  }

  /**
   * 打开移动端菜单
   */
  public openMobileMenu(): void {
    if (!this.state.isMobile || this.state.isMobileMenuOpen) return;
    
    this.state.isMobileMenuOpen = true;
    this.element.classList.add(this.mobileMenuClass);
    this.lockBodyScroll();
    this.notifyMenuToggleListeners();
  }

  /**
   * 关闭移动端菜单
   */
  public closeMobileMenu(): void {
    if (!this.state.isMobileMenuOpen) return;
    
    this.state.isMobileMenuOpen = false;
    this.element.classList.remove(this.mobileMenuClass);
    this.unlockBodyScroll();
    this.closeDropdown();
    this.notifyMenuToggleListeners();
  }

  /**
   * 切换移动端菜单状态
   */
  public toggleMobileMenu(): void {
    if (this.state.isMobileMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  /**
   * 打开指定下拉菜单
   * @param dropdownId - 下拉菜单 ID
   */
  public openDropdown(dropdownId: string): void {
    if (this.state.activeDropdown === dropdownId) return;
    
    if (this.state.activeDropdown) {
      const prevDropdown = document.querySelector(`[data-dropdown="${this.state.activeDropdown}"]`);
      if (prevDropdown) {
        prevDropdown.classList.remove(this.dropdownActiveClass);
      }
    }
    
    this.state.activeDropdown = dropdownId;
    const dropdown = document.querySelector(`[data-dropdown="${dropdownId}"]`);
    if (dropdown) {
      dropdown.classList.add(this.dropdownActiveClass);
    }
    
    this.notifyDropdownToggleListeners();
  }

  /**
   * 关闭当前下拉菜单
   */
  public closeDropdown(): void {
    if (!this.state.activeDropdown) return;
    
    const dropdown = document.querySelector(`[data-dropdown="${this.state.activeDropdown}"]`);
    if (dropdown) {
      dropdown.classList.remove(this.dropdownActiveClass);
    }
    
    this.state.activeDropdown = null;
    this.notifyDropdownToggleListeners();
  }

  /**
   * 切换指定下拉菜单状态
   * @param dropdownId - 下拉菜单 ID
   */
  public toggleDropdown(dropdownId: string): void {
    if (this.state.activeDropdown === dropdownId) {
      this.closeDropdown();
    } else {
      this.openDropdown(dropdownId);
    }
  }

  /**
   * 获取当前状态
   */
  public getState(): Readonly<NavigationState> {
    return { ...this.state };
  }

  /**
   * 监听移动端菜单切换事件
   * @param callback - 回调函数
   * @returns 取消监听的函数
   */
  public onMenuToggle(callback: (isOpen: boolean) => void): () => void {
    this.menuToggleListeners.push(callback);
    return () => {
      const index = this.menuToggleListeners.indexOf(callback);
      if (index > -1) {
        this.menuToggleListeners.splice(index, 1);
      }
    };
  }

  /**
   * 监听下拉菜单切换事件
   * @param callback - 回调函数
   * @returns 取消监听的函数
   */
  public onDropdownToggle(callback: (dropdownId: string | null) => void): () => void {
    this.dropdownToggleListeners.push(callback);
    return () => {
      const index = this.dropdownToggleListeners.indexOf(callback);
      if (index > -1) {
        this.dropdownToggleListeners.splice(index, 1);
      }
    };
  }

  /**
   * 监听滚动事件
   * @param callback - 回调函数
   * @returns 取消监听的函数
   */
  public onScroll(callback: (state: { isHidden: boolean; direction: ScrollDirection }) => void): () => void {
    this.scrollListeners.push(callback);
    return () => {
      const index = this.scrollListeners.indexOf(callback);
      if (index > -1) {
        this.scrollListeners.splice(index, 1);
      }
    };
  }

  /**
   * 销毁实例，清理事件监听
   */
  public destroy(): void {
    if (this.boundHandleScroll) {
      window.removeEventListener('scroll', this.boundHandleScroll);
    }
    
    if (this.boundHandleResize) {
      window.removeEventListener('resize', this.boundHandleResize);
    }
    
    if (this.boundHandleClickOutside) {
      document.removeEventListener('click', this.boundHandleClickOutside);
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    this.closeMobileMenu();
    this.closeDropdown();
    
    this.menuToggleListeners = [];
    this.dropdownToggleListeners = [];
    this.scrollListeners = [];
  }
}
