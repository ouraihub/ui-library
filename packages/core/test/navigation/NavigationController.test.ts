import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NavigationController } from '../../src/navigation/NavigationController';

describe('NavigationController', () => {
  let element: HTMLElement;
  let nav: NavigationController;

  beforeEach(() => {
    element = document.createElement('nav');
    document.body.appendChild(element);
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (nav) {
      nav.destroy();
    }
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
    document.body.className = '';
    document.body.style.overflow = '';
  });

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      nav = new NavigationController(element);
      const state = nav.getState();
      expect(state.isMobileMenuOpen).toBe(false);
      expect(state.activeDropdown).toBe(null);
      expect(state.isHidden).toBe(false);
    });

    it('should accept custom mobileBreakpoint', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });
      nav = new NavigationController(element, { mobileBreakpoint: 600 });
      const state = nav.getState();
      expect(state.isMobile).toBe(true);
    });

    it('should accept custom CSS classes', () => {
      nav = new NavigationController(element, {
        mobileMenuClass: 'custom-menu',
        dropdownActiveClass: 'custom-dropdown',
        hiddenClass: 'custom-hidden',
        bodyLockClass: 'custom-lock'
      });
      nav.openMobileMenu();
      expect(element.classList.contains('custom-menu')).toBe(true);
      expect(document.body.classList.contains('custom-lock')).toBe(true);
    });

    it('should throw error if element is not provided', () => {
      expect(() => new NavigationController(null as any)).toThrow(
        '[NavigationController] Navigation element is required'
      );
    });

    it('should initialize scroll tracking when hideOnScroll is true', () => {
      nav = new NavigationController(element, { hideOnScroll: true });
      const state = nav.getState();
      expect(state.lastScrollY).toBe(window.scrollY);
    });
  });

  describe('Mobile Menu', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });
      nav = new NavigationController(element, { mobileBreakpoint: 768 });
    });

    it('should open mobile menu', () => {
      nav.openMobileMenu();
      const state = nav.getState();
      expect(state.isMobileMenuOpen).toBe(true);
      expect(element.classList.contains('mobile-menu-open')).toBe(true);
      expect(document.body.classList.contains('scroll-lock')).toBe(true);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should close mobile menu', () => {
      nav.openMobileMenu();
      nav.closeMobileMenu();
      const state = nav.getState();
      expect(state.isMobileMenuOpen).toBe(false);
      expect(element.classList.contains('mobile-menu-open')).toBe(false);
      expect(document.body.classList.contains('scroll-lock')).toBe(false);
      expect(document.body.style.overflow).toBe('');
    });

    it('should toggle mobile menu', () => {
      nav.toggleMobileMenu();
      expect(nav.getState().isMobileMenuOpen).toBe(true);
      nav.toggleMobileMenu();
      expect(nav.getState().isMobileMenuOpen).toBe(false);
    });

    it('should not open menu if already open', () => {
      nav.openMobileMenu();
      const callback = vi.fn();
      nav.onMenuToggle(callback);
      nav.openMobileMenu();
      expect(callback).not.toHaveBeenCalled();
    });

    it('should not close menu if already closed', () => {
      const callback = vi.fn();
      nav.onMenuToggle(callback);
      nav.closeMobileMenu();
      expect(callback).not.toHaveBeenCalled();
    });

    it('should not open menu in desktop mode', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });
      nav = new NavigationController(element, { mobileBreakpoint: 768 });
      nav.openMobileMenu();
      expect(nav.getState().isMobileMenuOpen).toBe(false);
    });

    it('should trigger menu toggle callback', () => {
      const callback = vi.fn();
      nav.onMenuToggle(callback);
      nav.openMobileMenu();
      expect(callback).toHaveBeenCalledWith(true);
      nav.closeMobileMenu();
      expect(callback).toHaveBeenCalledWith(false);
    });

    it('should close dropdown when closing mobile menu', () => {
      const dropdown = document.createElement('div');
      dropdown.setAttribute('data-dropdown', 'test');
      document.body.appendChild(dropdown);

      nav.openMobileMenu();
      nav.openDropdown('test');
      expect(nav.getState().activeDropdown).toBe('test');
      
      nav.closeMobileMenu();
      expect(nav.getState().activeDropdown).toBe(null);

      document.body.removeChild(dropdown);
    });
  });

  describe('Dropdown Menu', () => {
    beforeEach(() => {
      nav = new NavigationController(element);
    });

    it('should open dropdown', () => {
      const dropdown = document.createElement('div');
      dropdown.setAttribute('data-dropdown', 'menu1');
      document.body.appendChild(dropdown);

      nav.openDropdown('menu1');
      expect(nav.getState().activeDropdown).toBe('menu1');
      expect(dropdown.classList.contains('dropdown-active')).toBe(true);

      document.body.removeChild(dropdown);
    });

    it('should close dropdown', () => {
      const dropdown = document.createElement('div');
      dropdown.setAttribute('data-dropdown', 'menu1');
      document.body.appendChild(dropdown);

      nav.openDropdown('menu1');
      nav.closeDropdown();
      expect(nav.getState().activeDropdown).toBe(null);
      expect(dropdown.classList.contains('dropdown-active')).toBe(false);

      document.body.removeChild(dropdown);
    });

    it('should toggle dropdown', () => {
      const dropdown = document.createElement('div');
      dropdown.setAttribute('data-dropdown', 'menu1');
      document.body.appendChild(dropdown);

      nav.toggleDropdown('menu1');
      expect(nav.getState().activeDropdown).toBe('menu1');
      nav.toggleDropdown('menu1');
      expect(nav.getState().activeDropdown).toBe(null);

      document.body.removeChild(dropdown);
    });

    it('should switch between dropdowns', () => {
      const dropdown1 = document.createElement('div');
      dropdown1.setAttribute('data-dropdown', 'menu1');
      const dropdown2 = document.createElement('div');
      dropdown2.setAttribute('data-dropdown', 'menu2');
      document.body.appendChild(dropdown1);
      document.body.appendChild(dropdown2);

      nav.openDropdown('menu1');
      expect(dropdown1.classList.contains('dropdown-active')).toBe(true);

      nav.openDropdown('menu2');
      expect(dropdown1.classList.contains('dropdown-active')).toBe(false);
      expect(dropdown2.classList.contains('dropdown-active')).toBe(true);
      expect(nav.getState().activeDropdown).toBe('menu2');

      document.body.removeChild(dropdown1);
      document.body.removeChild(dropdown2);
    });

    it('should not reopen same dropdown', () => {
      const dropdown = document.createElement('div');
      dropdown.setAttribute('data-dropdown', 'menu1');
      document.body.appendChild(dropdown);

      nav.openDropdown('menu1');
      const callback = vi.fn();
      nav.onDropdownToggle(callback);
      nav.openDropdown('menu1');
      expect(callback).not.toHaveBeenCalled();

      document.body.removeChild(dropdown);
    });

    it('should trigger dropdown toggle callback', () => {
      const dropdown = document.createElement('div');
      dropdown.setAttribute('data-dropdown', 'menu1');
      document.body.appendChild(dropdown);

      const callback = vi.fn();
      nav.onDropdownToggle(callback);
      nav.openDropdown('menu1');
      expect(callback).toHaveBeenCalledWith('menu1');
      nav.closeDropdown();
      expect(callback).toHaveBeenCalledWith(null);

      document.body.removeChild(dropdown);
    });

    it('should close dropdown when clicking outside', () => {
      const dropdown = document.createElement('div');
      dropdown.setAttribute('data-dropdown', 'menu1');
      document.body.appendChild(dropdown);

      nav.openDropdown('menu1');
      expect(nav.getState().activeDropdown).toBe('menu1');

      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);
      outsideElement.click();

      expect(nav.getState().activeDropdown).toBe(null);

      document.body.removeChild(dropdown);
      document.body.removeChild(outsideElement);
    });

    it('should not close dropdown when clicking inside', () => {
      const dropdown = document.createElement('div');
      dropdown.setAttribute('data-dropdown', 'menu1');
      const insideElement = document.createElement('button');
      dropdown.appendChild(insideElement);
      document.body.appendChild(dropdown);

      nav.openDropdown('menu1');
      insideElement.click();

      expect(nav.getState().activeDropdown).toBe('menu1');

      document.body.removeChild(dropdown);
    });
  });

  describe('Scroll Behavior', () => {
    beforeEach(() => {
      nav = new NavigationController(element, {
        hideOnScroll: true,
        scrollThreshold: 100
      });
    });

    it('should hide navigation when scrolling down past threshold', () => {
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 0
      });

      window.dispatchEvent(new Event('scroll'));

      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 150
      });

      window.dispatchEvent(new Event('scroll'));

      expect(element.classList.contains('nav-hidden')).toBe(true);
      expect(nav.getState().isHidden).toBe(true);
      expect(nav.getState().scrollDirection).toBe('down');
    });

    it('should show navigation when scrolling up', () => {
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 200
      });

      window.dispatchEvent(new Event('scroll'));

      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 150
      });

      window.dispatchEvent(new Event('scroll'));

      expect(element.classList.contains('nav-hidden')).toBe(false);
      expect(nav.getState().isHidden).toBe(false);
      expect(nav.getState().scrollDirection).toBe('up');
    });

    it('should not hide navigation below threshold', () => {
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 50
      });

      window.dispatchEvent(new Event('scroll'));

      expect(element.classList.contains('nav-hidden')).toBe(false);
      expect(nav.getState().isHidden).toBe(false);
    });

    it('should ignore small scroll deltas', () => {
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 100
      });

      window.dispatchEvent(new Event('scroll'));

      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 103
      });

      const callback = vi.fn();
      nav.onScroll(callback);
      window.dispatchEvent(new Event('scroll'));

      expect(callback).not.toHaveBeenCalled();
    });

    it('should trigger scroll callback', () => {
      const callback = vi.fn();
      nav.onScroll(callback);

      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 0
      });

      window.dispatchEvent(new Event('scroll'));

      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 150
      });

      window.dispatchEvent(new Event('scroll'));

      expect(callback).toHaveBeenCalledWith({
        isHidden: true,
        direction: 'down'
      });
    });

    it('should not track scroll when hideOnScroll is false', () => {
      nav.destroy();
      nav = new NavigationController(element, { hideOnScroll: false });

      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 200
      });

      window.dispatchEvent(new Event('scroll'));

      expect(element.classList.contains('nav-hidden')).toBe(false);
    });
  });

  describe('Responsive Breakpoint', () => {
    it('should detect mobile mode', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });
      nav = new NavigationController(element, { mobileBreakpoint: 768 });
      expect(nav.getState().isMobile).toBe(true);
    });

    it('should detect desktop mode', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });
      nav = new NavigationController(element, { mobileBreakpoint: 768 });
      expect(nav.getState().isMobile).toBe(false);
    });

    it('should close mobile menu when resizing to desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });
      nav = new NavigationController(element, { mobileBreakpoint: 768 });
      nav.openMobileMenu();
      expect(nav.getState().isMobileMenuOpen).toBe(true);

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });
      window.dispatchEvent(new Event('resize'));

      expect(nav.getState().isMobileMenuOpen).toBe(false);
      expect(nav.getState().isMobile).toBe(false);
    });

    it('should not close menu when resizing within mobile range', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });
      nav = new NavigationController(element, { mobileBreakpoint: 768 });
      nav.openMobileMenu();

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600
      });
      window.dispatchEvent(new Event('resize'));

      expect(nav.getState().isMobileMenuOpen).toBe(true);
    });
  });

  describe('Event Callbacks', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });
      nav = new NavigationController(element, { mobileBreakpoint: 768 });
    });

    it('should support multiple menu toggle callbacks', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      nav.onMenuToggle(callback1);
      nav.onMenuToggle(callback2);
      nav.openMobileMenu();
      expect(callback1).toHaveBeenCalledWith(true);
      expect(callback2).toHaveBeenCalledWith(true);
    });

    it('should support unsubscribe from menu toggle', () => {
      const callback = vi.fn();
      const unsubscribe = nav.onMenuToggle(callback);
      nav.openMobileMenu();
      expect(callback).toHaveBeenCalledTimes(1);
      unsubscribe();
      nav.closeMobileMenu();
      nav.openMobileMenu();
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should support multiple dropdown toggle callbacks', () => {
      const dropdown = document.createElement('div');
      dropdown.setAttribute('data-dropdown', 'menu1');
      document.body.appendChild(dropdown);

      const callback1 = vi.fn();
      const callback2 = vi.fn();
      nav.onDropdownToggle(callback1);
      nav.onDropdownToggle(callback2);
      nav.openDropdown('menu1');
      expect(callback1).toHaveBeenCalledWith('menu1');
      expect(callback2).toHaveBeenCalledWith('menu1');

      document.body.removeChild(dropdown);
    });

    it('should support unsubscribe from dropdown toggle', () => {
      const dropdown = document.createElement('div');
      dropdown.setAttribute('data-dropdown', 'menu1');
      document.body.appendChild(dropdown);

      const callback = vi.fn();
      const unsubscribe = nav.onDropdownToggle(callback);
      nav.openDropdown('menu1');
      expect(callback).toHaveBeenCalledTimes(1);
      unsubscribe();
      nav.closeDropdown();
      nav.openDropdown('menu1');
      expect(callback).toHaveBeenCalledTimes(1);

      document.body.removeChild(dropdown);
    });

    it('should support multiple scroll callbacks', () => {
      nav.destroy();
      nav = new NavigationController(element, { hideOnScroll: true, scrollThreshold: 100 });

      const callback1 = vi.fn();
      const callback2 = vi.fn();
      nav.onScroll(callback1);
      nav.onScroll(callback2);

      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 0
      });
      window.dispatchEvent(new Event('scroll'));

      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 150
      });
      window.dispatchEvent(new Event('scroll'));

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should support unsubscribe from scroll', () => {
      nav.destroy();
      nav = new NavigationController(element, { hideOnScroll: true, scrollThreshold: 100 });

      const callback = vi.fn();
      const unsubscribe = nav.onScroll(callback);

      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 0
      });
      window.dispatchEvent(new Event('scroll'));

      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 150
      });
      window.dispatchEvent(new Event('scroll'));

      const callCount = callback.mock.calls.length;
      expect(callCount).toBeGreaterThan(0);

      unsubscribe();
      callback.mockClear();

      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 0
      });
      window.dispatchEvent(new Event('scroll'));

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('destroy()', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });
      nav = new NavigationController(element, {
        mobileBreakpoint: 768,
        hideOnScroll: true
      });
    });

    it('should remove all event listeners', () => {
      const scrollSpy = vi.spyOn(window, 'removeEventListener');
      const documentSpy = vi.spyOn(document, 'removeEventListener');
      nav.destroy();
      expect(scrollSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
      expect(scrollSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(documentSpy).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should close mobile menu', () => {
      nav.openMobileMenu();
      nav.destroy();
      expect(document.body.classList.contains('scroll-lock')).toBe(false);
      expect(document.body.style.overflow).toBe('');
    });

    it('should close dropdown', () => {
      const dropdown = document.createElement('div');
      dropdown.setAttribute('data-dropdown', 'menu1');
      document.body.appendChild(dropdown);

      nav.openDropdown('menu1');
      nav.destroy();
      expect(dropdown.classList.contains('dropdown-active')).toBe(false);

      document.body.removeChild(dropdown);
    });

    it('should clear all callbacks', () => {
      const menuCallback = vi.fn();
      const dropdownCallback = vi.fn();
      const scrollCallback = vi.fn();

      nav.onMenuToggle(menuCallback);
      nav.onDropdownToggle(dropdownCallback);
      nav.onScroll(scrollCallback);

      nav.destroy();

      nav = new NavigationController(element, { mobileBreakpoint: 768 });
      nav.openMobileMenu();

      expect(menuCallback).not.toHaveBeenCalled();
      expect(dropdownCallback).not.toHaveBeenCalled();
      expect(scrollCallback).not.toHaveBeenCalled();
    });
  });

  describe('getState()', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });
      nav = new NavigationController(element, { mobileBreakpoint: 768 });
    });

    it('should return current state', () => {
      const state = nav.getState();
      expect(state).toHaveProperty('isMobileMenuOpen');
      expect(state).toHaveProperty('activeDropdown');
      expect(state).toHaveProperty('isHidden');
      expect(state).toHaveProperty('isMobile');
      expect(state).toHaveProperty('lastScrollY');
      expect(state).toHaveProperty('scrollDirection');
    });

    it('should return immutable state', () => {
      const state = nav.getState();
      const originalOpen = state.isMobileMenuOpen;
      (state as any).isMobileMenuOpen = !originalOpen;
      expect(nav.getState().isMobileMenuOpen).toBe(originalOpen);
    });
  });
});
