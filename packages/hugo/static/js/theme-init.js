/**
 * ThemeManager - 主题切换管理器
 * 核心逻辑：light/dark/system 三态切换，localStorage 持久化
 */
class ThemeManager {
  constructor(element = document.documentElement, options = {}) {
    this.element = element;
    this.storageKey = options.storageKey || 'theme';
    this.attribute = options.attribute || 'data-theme';
    this.currentTheme = options.defaultTheme || 'system';
    this.mediaQuery = null;
    this.listeners = [];
    
    this.init();
  }

  init() {
    const saved = this.loadFromStorage();
    if (saved) {
      this.currentTheme = saved;
    }
    
    this.applyTheme();
    this.watchSystemTheme();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch (e) {
      console.warn('[ThemeManager] localStorage unavailable');
    }
    return null;
  }

  saveToStorage(theme) {
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch (e) {
      console.warn('[ThemeManager] Failed to save theme');
    }
  }

  watchSystemTheme() {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handler = () => {
      if (this.currentTheme === 'system') {
        this.applyTheme();
        this.notifyListeners();
      }
    };
    
    if (this.mediaQuery.addEventListener) {
      this.mediaQuery.addEventListener('change', handler);
    } else {
      this.mediaQuery.addListener(handler);
    }
  }

  resolveTheme() {
    if (this.currentTheme === 'system') {
      if (this.mediaQuery?.matches) {
        return 'dark';
      }
      return 'light';
    }
    return this.currentTheme;
  }

  applyTheme() {
    const resolved = this.resolveTheme();
    this.element.setAttribute(this.attribute, resolved);
  }

  notifyListeners() {
    const resolved = this.resolveTheme();
    this.listeners.forEach(fn => fn(resolved));
  }

  setTheme(mode) {
    this.currentTheme = mode;
    this.saveToStorage(mode);
    this.applyTheme();
    this.notifyListeners();
  }

  getTheme() {
    return this.currentTheme;
  }

  toggle() {
    const resolved = this.resolveTheme();
    const next = resolved === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  onThemeChange(callback) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

/**
 * 自动初始化主题切换按钮
 * 扫描所有 [data-ui-component="theme-toggle"] 元素
 * 为每个元素创建 ThemeManager 实例并绑定点击事件
 */
function initThemeToggles() {
  const toggles = document.querySelectorAll('[data-ui-component="theme-toggle"]');
  
  toggles.forEach((element) => {
    const storageKey = element.getAttribute('data-ui-storage-key') || 'theme';
    const attribute = element.getAttribute('data-ui-attribute') || 'data-theme';
    
    const manager = new ThemeManager(document.documentElement, {
      storageKey,
      attribute,
    });
    
    element.addEventListener('click', () => {
      manager.toggle();
    });
    
    manager.onThemeChange((theme) => {
      console.log('[ThemeManager] Theme changed:', theme);
    });
  });
}

function initNavigationControllers() {
  const navs = document.querySelectorAll('[data-ui-component="navigation"]');
  
  navs.forEach((element) => {
    const mobileBreakpoint = parseInt(element.getAttribute('data-ui-mobile-breakpoint') || '768', 10);
    const menu = element.querySelector('.navigation-menu');
    const toggle = element.querySelector('.navigation-mobile-toggle');
    
    if (!menu || !toggle) return;
    
    const isMobile = () => window.innerWidth < mobileBreakpoint;
    
    toggle.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !isExpanded);
      menu.setAttribute('aria-hidden', isExpanded);
    });
    
    const dropdownToggles = element.querySelectorAll('.navigation-dropdown-toggle');
    dropdownToggles.forEach((dropdownToggle) => {
      dropdownToggle.addEventListener('click', (e) => {
        if (isMobile()) {
          e.preventDefault();
          const isExpanded = dropdownToggle.getAttribute('aria-expanded') === 'true';
          dropdownToggle.setAttribute('aria-expanded', !isExpanded);
        }
      });
    });
    
    window.addEventListener('resize', () => {
      if (!isMobile()) {
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
      }
    });
  });
}

function initLazyLoaders() {
  const images = document.querySelectorAll('[data-ui-component="lazy-image"]');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          
          if (src) {
            img.src = src;
            img.addEventListener('load', () => {
              img.classList.add('loaded');
            });
            img.addEventListener('error', () => {
              img.classList.add('error');
            });
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px'
    });
    
    images.forEach((img) => observer.observe(img));
  } else {
    images.forEach((img) => {
      const src = img.getAttribute('data-src');
      if (src) {
        img.src = src;
        img.classList.add('loaded');
      }
    });
  }
}

function initSearchModals() {
  const modals = document.querySelectorAll('[data-ui-component="search-modal"]');
  
  modals.forEach((modal) => {
    const overlay = modal.querySelector('.search-modal-overlay');
    const closeBtn = modal.querySelector('.search-modal-close');
    const input = modal.querySelector('.search-input');
    const resultsList = modal.querySelector('.search-results-list');
    const loading = modal.querySelector('.search-loading');
    const noResults = modal.querySelector('.search-no-results');
    const endpoint = modal.getAttribute('data-ui-search-endpoint') || '/search.json';
    
    let searchData = [];
    let selectedIndex = -1;
    
    const openModal = () => {
      modal.setAttribute('aria-hidden', 'false');
      input?.focus();
    };
    
    const closeModal = () => {
      modal.setAttribute('aria-hidden', 'true');
      if (input) input.value = '';
      selectedIndex = -1;
      if (resultsList) resultsList.innerHTML = '';
    };
    
    const performSearch = (query) => {
      if (!query.trim()) {
        if (resultsList) resultsList.setAttribute('aria-hidden', 'true');
        if (noResults) noResults.setAttribute('aria-hidden', 'true');
        return;
      }
      
      const results = searchData.filter((item) => {
        const searchText = `${item.title} ${item.content}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      }).slice(0, 10);
      
      if (results.length === 0) {
        if (resultsList) resultsList.setAttribute('aria-hidden', 'true');
        if (noResults) noResults.setAttribute('aria-hidden', 'false');
      } else {
        if (noResults) noResults.setAttribute('aria-hidden', 'true');
        if (resultsList) {
          resultsList.setAttribute('aria-hidden', 'false');
          resultsList.innerHTML = results.map((result, index) => `
            <li class="search-result-item" role="option">
              <a href="${result.url}" class="search-result-link" ${index === 0 ? 'aria-selected="true"' : ''}>
                <div class="search-result-title">${result.title}</div>
                <div class="search-result-excerpt">${result.excerpt || ''}</div>
              </a>
            </li>
          `).join('');
          selectedIndex = 0;
        }
      }
    };
    
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        searchData = data;
      })
      .catch(() => {
        console.warn('[SearchModal] Failed to load search data');
      });
    
    if (overlay) {
      overlay.addEventListener('click', closeModal);
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
    
    if (input) {
      input.addEventListener('input', (e) => {
        performSearch(e.target.value);
      });
      
      input.addEventListener('keydown', (e) => {
        const items = resultsList?.querySelectorAll('.search-result-link');
        if (!items || items.length === 0) return;
        
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
          items.forEach((item, i) => {
            item.setAttribute('aria-selected', i === selectedIndex ? 'true' : 'false');
          });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedIndex = Math.max(selectedIndex - 1, 0);
          items.forEach((item, i) => {
            item.setAttribute('aria-selected', i === selectedIndex ? 'true' : 'false');
          });
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
          e.preventDefault();
          items[selectedIndex]?.click();
        } else if (e.key === 'Escape') {
          closeModal();
        }
      });
    }
    
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openModal();
      } else if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
        closeModal();
      }
    });
  });
}

function initAllComponents() {
  initThemeToggles();
  initNavigationControllers();
  initLazyLoaders();
  initSearchModals();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllComponents);
} else {
  initAllComponents();
}
