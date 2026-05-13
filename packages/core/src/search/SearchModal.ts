/**
 * SearchModal - 搜索模态框管理器
 * 
 * 提供完整的搜索模态框功能，包括：
 * - 模态框控制（打开/关闭）
 * - 键盘快捷键（Ctrl+K / Cmd+K）
 * - 防抖搜索
 * - 焦点管理和焦点陷阱
 * - 滚动锁定
 * - 点击外部关闭
 * 
 * @example
 * ```typescript
 * const searchModal = new SearchModal({
 *   onSearch: async (query) => {
 *     return await fetchSearchResults(query);
 *   },
 *   onSelect: (result) => {
 *     window.location.href = result.url;
 *   }
 * });
 * 
 * // 打开搜索模态框
 * searchModal.open();
 * ```
 */

/**
 * 搜索结果接口
 */
export interface SearchResult {
  /** 结果唯一标识 */
  id: string;
  /** 结果标题 */
  title: string;
  /** 结果描述 */
  description?: string;
  /** 结果 URL */
  url: string;
  /** 结果类型（如：page, post, doc） */
  type?: string;
  /** 额外元数据 */
  metadata?: Record<string, unknown>;
}

/**
 * 搜索模态框配置选项
 */
export interface SearchModalOptions {
  /** 模态框容器元素，默认为 document.body */
  container?: HTMLElement;
  /** 键盘快捷键，默认为 ['ctrl+k', 'cmd+k'] */
  shortcuts?: string[];
  /** 搜索防抖延迟（毫秒），默认为 300 */
  debounceDelay?: number;
  /** 最小搜索字符数，默认为 2 */
  minSearchLength?: number;
  /** 打开时的回调 */
  onOpen?: () => void;
  /** 关闭时的回调 */
  onClose?: () => void;
  /** 搜索回调（返回搜索结果） */
  onSearch?: (query: string) => Promise<SearchResult[]> | SearchResult[];
  /** 选择结果时的回调 */
  onSelect?: (result: SearchResult) => void;
  /** 模态框 CSS 类名 */
  modalClass?: string;
  /** 输入框占位符文本 */
  placeholder?: string;
}

/**
 * 搜索模态框状态
 */
export interface SearchModalState {
  /** 是否打开 */
  isOpen: boolean;
  /** 当前搜索查询 */
  query: string;
  /** 搜索结果 */
  results: SearchResult[];
  /** 当前选中的结果索引 */
  selectedIndex: number;
  /** 是否正在搜索 */
  isSearching: boolean;
}

export class SearchModal {
  private container: HTMLElement;
  private shortcuts: string[];
  private debounceDelay: number;
  private minSearchLength: number;
  private modalClass: string;
  private placeholder: string;
  
  private state: SearchModalState = {
    isOpen: false,
    query: '',
    results: [],
    selectedIndex: -1,
    isSearching: false,
  };
  
  private modalElement: HTMLElement | null = null;
  private inputElement: HTMLInputElement | null = null;
  private resultsElement: HTMLElement | null = null;
  private previousActiveElement: Element | null = null;
  
  private debounceTimer: number | null = null;
  private focusableElements: HTMLElement[] = [];
  
  private onOpenCallback?: () => void;
  private onCloseCallback?: () => void;
  private onSearchCallback?: (query: string) => Promise<SearchResult[]> | SearchResult[];
  private onSelectCallback?: (result: SearchResult) => void;

  constructor(options: SearchModalOptions = {}) {
    this.container = options.container || document.body;
    this.shortcuts = options.shortcuts || ['ctrl+k', 'cmd+k'];
    this.debounceDelay = options.debounceDelay ?? 300;
    this.minSearchLength = options.minSearchLength ?? 2;
    this.modalClass = options.modalClass || 'search-modal';
    this.placeholder = options.placeholder || '搜索...';
    
    this.onOpenCallback = options.onOpen;
    this.onCloseCallback = options.onClose;
    this.onSearchCallback = options.onSearch;
    this.onSelectCallback = options.onSelect;
    
    this.init();
  }

  private init(): void {
    if (typeof window === 'undefined') return;
    
    this.setupKeyboardShortcuts();
    this.createModal();
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', this.handleGlobalKeydown);
  }

  private handleGlobalKeydown = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey;
    
    // 检查快捷键
    const shortcutMatch = this.shortcuts.some(shortcut => {
      const parts = shortcut.toLowerCase().split('+');
      const hasCtrl = parts.includes('ctrl') || parts.includes('cmd');
      const keyPart = parts[parts.length - 1];
      
      return hasCtrl && ctrl && key === keyPart;
    });
    
    if (shortcutMatch) {
      event.preventDefault();
      this.toggle();
    }
    
    // ESC 键关闭
    if (this.state.isOpen && key === 'escape') {
      event.preventDefault();
      this.close();
    }
  };

  private createModal(): void {
    const modal = document.createElement('div');
    modal.className = this.modalClass;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', '搜索');
    modal.style.display = 'none';
    
    modal.innerHTML = `
      <div class="${this.modalClass}__overlay" aria-hidden="true"></div>
      <div class="${this.modalClass}__content">
        <div class="${this.modalClass}__input-wrapper">
          <input
            type="text"
            class="${this.modalClass}__input"
            placeholder="${this.placeholder}"
            aria-label="搜索输入"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          />
        </div>
        <div class="${this.modalClass}__results" role="listbox" aria-label="搜索结果"></div>
      </div>
    `;
    
    this.container.appendChild(modal);
    this.modalElement = modal;
    this.inputElement = modal.querySelector(`.${this.modalClass}__input`);
    this.resultsElement = modal.querySelector(`.${this.modalClass}__results`);
    
    this.setupModalEvents();
  }

  private setupModalEvents(): void {
    if (!this.modalElement || !this.inputElement) return;
    
    // 输入事件
    this.inputElement.addEventListener('input', this.handleInput);
    
    // 键盘导航
    this.inputElement.addEventListener('keydown', this.handleInputKeydown);
    
    // 点击外部关闭
    this.modalElement.addEventListener('click', this.handleOverlayClick);
    
    // 焦点陷阱
    this.modalElement.addEventListener('keydown', this.handleFocusTrap);
  }

  private handleInput = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    const query = target.value.trim();
    
    this.state.query = query;
    
    // 清除之前的防抖计时器
    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
    }
    
    // 如果查询长度不足，清空结果
    if (query.length < this.minSearchLength) {
      this.state.results = [];
      this.state.selectedIndex = -1;
      this.renderResults();
      return;
    }
    
    // 防抖搜索
    this.debounceTimer = window.setTimeout(() => {
      this.performSearch(query);
    }, this.debounceDelay);
  };

  private async performSearch(query: string): Promise<void> {
    if (!this.onSearchCallback) return;
    
    this.state.isSearching = true;
    this.renderResults();
    
    try {
      const results = await this.onSearchCallback(query);
      this.state.results = results;
      this.state.selectedIndex = results.length > 0 ? 0 : -1;
    } catch (error) {
      console.error('[SearchModal] Search failed:', error);
      this.state.results = [];
      this.state.selectedIndex = -1;
    } finally {
      this.state.isSearching = false;
      this.renderResults();
    }
  }

  private handleInputKeydown = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase();
    
    switch (key) {
      case 'arrowdown':
        event.preventDefault();
        this.selectNext();
        break;
      case 'arrowup':
        event.preventDefault();
        this.selectPrevious();
        break;
      case 'enter':
        event.preventDefault();
        this.selectCurrent();
        break;
    }
  };

  private selectNext(): void {
    if (this.state.results.length === 0) return;
    
    this.state.selectedIndex = (this.state.selectedIndex + 1) % this.state.results.length;
    this.renderResults();
    this.scrollToSelected();
  }

  private selectPrevious(): void {
    if (this.state.results.length === 0) return;
    
    this.state.selectedIndex = this.state.selectedIndex <= 0
      ? this.state.results.length - 1
      : this.state.selectedIndex - 1;
    this.renderResults();
    this.scrollToSelected();
  }

  private selectCurrent(): void {
    if (this.state.selectedIndex < 0 || this.state.selectedIndex >= this.state.results.length) {
      return;
    }
    
    const result = this.state.results[this.state.selectedIndex];
    this.onSelectCallback?.(result);
    this.close();
  }

  private scrollToSelected(): void {
    if (!this.resultsElement) return;
    
    const selectedElement = this.resultsElement.querySelector(
      `[data-index="${this.state.selectedIndex}"]`
    ) as HTMLElement;
    
    if (selectedElement && typeof selectedElement.scrollIntoView === 'function') {
      selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  private handleOverlayClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    if (target.classList.contains(`${this.modalClass}__overlay`)) {
      this.close();
    }
  };

  private handleFocusTrap = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;
    
    this.updateFocusableElements();
    
    if (this.focusableElements.length === 0) return;
    
    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];
    
    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  private updateFocusableElements(): void {
    if (!this.modalElement) return;
    
    const selector = 'input, button, [href], [tabindex]:not([tabindex="-1"])';
    this.focusableElements = Array.from(
      this.modalElement.querySelectorAll(selector)
    ) as HTMLElement[];
  }

  private renderResults(): void {
    if (!this.resultsElement) return;
    
    if (this.state.isSearching) {
      this.resultsElement.innerHTML = `
        <div class="${this.modalClass}__loading">搜索中...</div>
      `;
      return;
    }
    
    if (this.state.results.length === 0) {
      if (this.state.query.length >= this.minSearchLength) {
        this.resultsElement.innerHTML = `
          <div class="${this.modalClass}__empty">未找到结果</div>
        `;
      } else {
        this.resultsElement.innerHTML = '';
      }
      return;
    }
    
    const resultsHTML = this.state.results.map((result, index) => {
      const isSelected = index === this.state.selectedIndex;
      const selectedClass = isSelected ? `${this.modalClass}__result--selected` : '';
      
      return `
        <div
          class="${this.modalClass}__result ${selectedClass}"
          role="option"
          aria-selected="${isSelected}"
          data-index="${index}"
          data-id="${result.id}"
        >
          <div class="${this.modalClass}__result-title">${this.escapeHtml(result.title)}</div>
          ${result.description ? `<div class="${this.modalClass}__result-description">${this.escapeHtml(result.description)}</div>` : ''}
          ${result.type ? `<div class="${this.modalClass}__result-type">${this.escapeHtml(result.type)}</div>` : ''}
        </div>
      `;
    }).join('');
    
    this.resultsElement.innerHTML = resultsHTML;
    
    // 添加点击事件
    this.resultsElement.querySelectorAll(`.${this.modalClass}__result`).forEach((element, index) => {
      element.addEventListener('click', () => {
        this.state.selectedIndex = index;
        this.selectCurrent();
      });
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private lockScroll(): void {
    if (typeof window === 'undefined') return;
    
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }

  private unlockScroll(): void {
    if (typeof window === 'undefined') return;
    
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  /**
   * 打开搜索模态框
   */
  public open(): void {
    if (this.state.isOpen || !this.modalElement || !this.inputElement) return;
    
    this.state.isOpen = true;
    this.previousActiveElement = document.activeElement;
    
    this.modalElement.style.display = 'block';
    this.lockScroll();
    
    // 延迟聚焦以确保模态框已显示
    setTimeout(() => {
      this.inputElement?.focus();
      this.updateFocusableElements();
    }, 50);
    
    this.onOpenCallback?.();
  }

  /**
   * 关闭搜索模态框
   */
  public close(): void {
    if (!this.state.isOpen || !this.modalElement) return;
    
    this.state.isOpen = false;
    this.state.query = '';
    this.state.results = [];
    this.state.selectedIndex = -1;
    
    this.modalElement.style.display = 'none';
    this.unlockScroll();
    
    if (this.inputElement) {
      this.inputElement.value = '';
    }
    
    if (this.resultsElement) {
      this.resultsElement.innerHTML = '';
    }
    
    // 恢复焦点
    if (this.previousActiveElement instanceof HTMLElement) {
      this.previousActiveElement.focus();
    }
    
    this.onCloseCallback?.();
  }

  /**
   * 切换搜索模态框状态
   */
  public toggle(): void {
    if (this.state.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * 获取当前状态
   */
  public getState(): Readonly<SearchModalState> {
    return { ...this.state };
  }

  /**
   * 销毁搜索模态框，清理所有事件监听器
   */
  public destroy(): void {
    this.close();
    
    document.removeEventListener('keydown', this.handleGlobalKeydown);
    
    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
    }
    
    if (this.modalElement) {
      this.modalElement.remove();
      this.modalElement = null;
    }
    
    this.inputElement = null;
    this.resultsElement = null;
    this.focusableElements = [];
  }
}
