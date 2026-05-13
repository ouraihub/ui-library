import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SearchModal } from '../../src/search/SearchModal';
import type { SearchResult } from '../../src/search/SearchModal';

describe('SearchModal', () => {
  let modal: SearchModal;
  let mockResults: SearchResult[];

  beforeEach(() => {
    mockResults = [
      { id: '1', title: 'Result 1', description: 'Description 1', url: '/result-1', type: 'page' },
      { id: '2', title: 'Result 2', description: 'Description 2', url: '/result-2', type: 'post' },
      { id: '3', title: 'Result 3', url: '/result-3' },
    ];
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (modal) {
      modal.destroy();
    }
    document.body.innerHTML = '';
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      modal = new SearchModal();
      const state = modal.getState();
      expect(state.isOpen).toBe(false);
      expect(state.query).toBe('');
      expect(state.results).toEqual([]);
      expect(state.selectedIndex).toBe(-1);
    });

    it('should accept custom container', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      modal = new SearchModal({ container });
      expect(container.querySelector('.search-modal')).toBeTruthy();
    });

    it('should accept custom shortcuts', () => {
      modal = new SearchModal({ shortcuts: ['ctrl+f'] });
      const event = new KeyboardEvent('keydown', { key: 'f', ctrlKey: true });
      document.dispatchEvent(event);
      expect(modal.getState().isOpen).toBe(true);
    });

    it('should accept custom debounce delay', () => {
      modal = new SearchModal({ debounceDelay: 500 });
      expect(modal).toBeDefined();
    });

    it('should accept custom min search length', () => {
      modal = new SearchModal({ minSearchLength: 3 });
      expect(modal).toBeDefined();
    });

    it('should accept custom CSS class', () => {
      modal = new SearchModal({ modalClass: 'custom-search' });
      expect(document.querySelector('.custom-search')).toBeTruthy();
    });

    it('should accept custom placeholder', () => {
      modal = new SearchModal({ placeholder: 'Custom placeholder' });
      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      expect(input?.placeholder).toBe('Custom placeholder');
    });

    it('should create modal element in DOM', () => {
      modal = new SearchModal();
      expect(document.querySelector('.search-modal')).toBeTruthy();
      expect(document.querySelector('.search-modal__overlay')).toBeTruthy();
      expect(document.querySelector('.search-modal__content')).toBeTruthy();
      expect(document.querySelector('.search-modal__input')).toBeTruthy();
      expect(document.querySelector('.search-modal__results')).toBeTruthy();
    });
  });

  describe('open() and close()', () => {
    beforeEach(() => {
      modal = new SearchModal();
    });

    it('should open modal', () => {
      modal.open();
      const state = modal.getState();
      expect(state.isOpen).toBe(true);
      const modalElement = document.querySelector('.search-modal') as HTMLElement;
      expect(modalElement.style.display).toBe('block');
    });

    it('should close modal', () => {
      modal.open();
      modal.close();
      const state = modal.getState();
      expect(state.isOpen).toBe(false);
      const modalElement = document.querySelector('.search-modal') as HTMLElement;
      expect(modalElement.style.display).toBe('none');
    });

    it('should toggle modal', () => {
      modal.toggle();
      expect(modal.getState().isOpen).toBe(true);
      modal.toggle();
      expect(modal.getState().isOpen).toBe(false);
    });

    it('should not open if already open', () => {
      modal.open();
      const onOpen = vi.fn();
      modal = new SearchModal({ onOpen });
      modal.open();
      modal.open();
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('should not close if already closed', () => {
      const onClose = vi.fn();
      modal = new SearchModal({ onClose });
      modal.close();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should lock scroll when opening', () => {
      modal.open();
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should unlock scroll when closing', () => {
      modal.open();
      modal.close();
      expect(document.body.style.overflow).toBe('');
    });

    it('should focus input when opening', async () => {
      modal.open();
      await vi.waitFor(() => {
        const input = document.querySelector('.search-modal__input') as HTMLInputElement;
        expect(document.activeElement).toBe(input);
      }, { timeout: 100 });
    });

    it('should restore focus when closing', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);
      button.focus();

      modal.open();
      modal.close();

      expect(document.activeElement).toBe(button);
    });

    it('should clear state when closing', () => {
      modal.open();
      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      input.value = 'test query';
      input.dispatchEvent(new Event('input'));

      modal.close();

      const state = modal.getState();
      expect(state.query).toBe('');
      expect(state.results).toEqual([]);
      expect(state.selectedIndex).toBe(-1);
      expect(input.value).toBe('');
    });

    it('should call onOpen callback', () => {
      const onOpen = vi.fn();
      modal = new SearchModal({ onOpen });
      modal.open();
      expect(onOpen).toHaveBeenCalled();
    });

    it('should call onClose callback', () => {
      const onClose = vi.fn();
      modal = new SearchModal({ onClose });
      modal.open();
      modal.close();
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should open with Ctrl+K', () => {
      modal = new SearchModal();
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
      document.dispatchEvent(event);
      expect(modal.getState().isOpen).toBe(true);
    });

    it('should open with Cmd+K', () => {
      modal = new SearchModal();
      const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
      document.dispatchEvent(event);
      expect(modal.getState().isOpen).toBe(true);
    });

    it('should close with Escape', () => {
      modal = new SearchModal();
      modal.open();
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
      expect(modal.getState().isOpen).toBe(false);
    });

    it('should not close with Escape when modal is closed', () => {
      modal = new SearchModal();
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
      expect(modal.getState().isOpen).toBe(false);
    });

    it('should support custom shortcuts', () => {
      modal = new SearchModal({ shortcuts: ['ctrl+f', 'ctrl+s'] });
      
      const event1 = new KeyboardEvent('keydown', { key: 'f', ctrlKey: true });
      document.dispatchEvent(event1);
      expect(modal.getState().isOpen).toBe(true);
      
      modal.close();
      
      const event2 = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
      document.dispatchEvent(event2);
      expect(modal.getState().isOpen).toBe(true);
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should debounce search input', async () => {
      const onSearch = vi.fn().mockResolvedValue(mockResults);
      modal = new SearchModal({ onSearch, debounceDelay: 300 });
      modal.open();

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('input'));

      expect(onSearch).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(300);

      expect(onSearch).toHaveBeenCalledWith('test');
    });

    it('should cancel previous search on new input', async () => {
      const onSearch = vi.fn().mockResolvedValue(mockResults);
      modal = new SearchModal({ onSearch, debounceDelay: 300 });
      modal.open();

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      
      input.value = 'test1';
      input.dispatchEvent(new Event('input'));
      
      await vi.advanceTimersByTimeAsync(100);
      
      input.value = 'test2';
      input.dispatchEvent(new Event('input'));
      
      await vi.advanceTimersByTimeAsync(300);

      expect(onSearch).toHaveBeenCalledTimes(1);
      expect(onSearch).toHaveBeenCalledWith('test2');
    });

    it('should not search if query is too short', async () => {
      const onSearch = vi.fn().mockResolvedValue(mockResults);
      modal = new SearchModal({ onSearch, minSearchLength: 3 });
      modal.open();

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      input.value = 'ab';
      input.dispatchEvent(new Event('input'));

      await vi.advanceTimersByTimeAsync(300);

      expect(onSearch).not.toHaveBeenCalled();
    });

    it('should clear results if query is too short', async () => {
      const onSearch = vi.fn().mockResolvedValue(mockResults);
      modal = new SearchModal({ onSearch, minSearchLength: 2 });
      modal.open();

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      
      input.value = 'test';
      input.dispatchEvent(new Event('input'));
      await vi.advanceTimersByTimeAsync(300);

      input.value = 'a';
      input.dispatchEvent(new Event('input'));

      const state = modal.getState();
      expect(state.results).toEqual([]);
      expect(state.selectedIndex).toBe(-1);
    });

    it('should update results after search', async () => {
      const onSearch = vi.fn().mockResolvedValue(mockResults);
      modal = new SearchModal({ onSearch });
      modal.open();

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('input'));

      await vi.advanceTimersByTimeAsync(300);

      const state = modal.getState();
      expect(state.results).toEqual(mockResults);
      expect(state.selectedIndex).toBe(0);
    });

    it('should handle search errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onSearch = vi.fn().mockRejectedValue(new Error('Search failed'));
      modal = new SearchModal({ onSearch });
      modal.open();

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('input'));

      await vi.advanceTimersByTimeAsync(300);

      const state = modal.getState();
      expect(state.results).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('[SearchModal] Search failed:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should show loading state during search', async () => {
      const onSearch = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockResults), 100)));
      modal = new SearchModal({ onSearch });
      modal.open();

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('input'));

      await vi.advanceTimersByTimeAsync(300);

      expect(modal.getState().isSearching).toBe(true);

      await vi.advanceTimersByTimeAsync(100);

      expect(modal.getState().isSearching).toBe(false);
    });

    it('should render loading message', async () => {
      const onSearch = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockResults), 100)));
      modal = new SearchModal({ onSearch });
      modal.open();

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('input'));

      await vi.advanceTimersByTimeAsync(300);

      const resultsElement = document.querySelector('.search-modal__results');
      expect(resultsElement?.innerHTML).toContain('搜索中...');
    });

    it('should render empty message when no results', async () => {
      const onSearch = vi.fn().mockResolvedValue([]);
      modal = new SearchModal({ onSearch });
      modal.open();

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('input'));

      await vi.advanceTimersByTimeAsync(300);

      const resultsElement = document.querySelector('.search-modal__results');
      expect(resultsElement?.innerHTML).toContain('未找到结果');
    });

    it('should render search results', async () => {
      const onSearch = vi.fn().mockResolvedValue(mockResults);
      modal = new SearchModal({ onSearch });
      modal.open();

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('input'));

      await vi.advanceTimersByTimeAsync(300);

      const results = document.querySelectorAll('.search-modal__result');
      expect(results.length).toBe(3);
      expect(results[0].textContent).toContain('Result 1');
      expect(results[0].textContent).toContain('Description 1');
      expect(results[0].textContent).toContain('page');
    });

    it('should escape HTML in results', async () => {
      const xssResults: SearchResult[] = [
        { id: '1', title: '<script>alert("xss")</script>', url: '/test' }
      ];
      const onSearch = vi.fn().mockResolvedValue(xssResults);
      modal = new SearchModal({ onSearch });
      modal.open();

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('input'));

      await vi.advanceTimersByTimeAsync(300);

      const resultsElement = document.querySelector('.search-modal__results');
      expect(resultsElement?.innerHTML).not.toContain('<script>');
      expect(resultsElement?.textContent).toContain('alert("xss")');
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      const onSearch = vi.fn().mockResolvedValue(mockResults);
      modal = new SearchModal({ onSearch });
      modal.open();

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('input'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should select next result with ArrowDown', async () => {
      await vi.advanceTimersByTimeAsync(300);

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      
      expect(modal.getState().selectedIndex).toBe(0);
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      input.dispatchEvent(event);
      
      expect(modal.getState().selectedIndex).toBe(1);
    });

    it('should select previous result with ArrowUp', async () => {
      await vi.advanceTimersByTimeAsync(300);

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      input.dispatchEvent(downEvent);
      
      expect(modal.getState().selectedIndex).toBe(1);
      
      const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      input.dispatchEvent(upEvent);
      
      expect(modal.getState().selectedIndex).toBe(0);
    });

    it('should wrap to last result when pressing ArrowUp on first', async () => {
      await vi.advanceTimersByTimeAsync(300);

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      
      expect(modal.getState().selectedIndex).toBe(0);
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      input.dispatchEvent(event);
      
      expect(modal.getState().selectedIndex).toBe(2);
    });

    it('should wrap to first result when pressing ArrowDown on last', async () => {
      await vi.advanceTimersByTimeAsync(300);

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      
      expect(modal.getState().selectedIndex).toBe(2);
      
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      
      expect(modal.getState().selectedIndex).toBe(0);
    });

    it('should select current result with Enter', async () => {
      await vi.advanceTimersByTimeAsync(300);

      const onSelect = vi.fn();
      modal.destroy();
      modal = new SearchModal({ onSearch: vi.fn().mockResolvedValue(mockResults), onSelect });
      modal.open();

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('input'));

      await vi.advanceTimersByTimeAsync(300);

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      input.dispatchEvent(event);

      expect(onSelect).toHaveBeenCalledWith(mockResults[0]);
      expect(modal.getState().isOpen).toBe(false);
    });

    it('should not select if no results', async () => {
      modal.destroy();
      const onSelect = vi.fn();
      modal = new SearchModal({ onSearch: vi.fn().mockResolvedValue([]), onSelect });
      modal.open();

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('input'));

      await vi.advanceTimersByTimeAsync(300);

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      input.dispatchEvent(event);

      expect(onSelect).not.toHaveBeenCalled();
    });

    it('should update selected class on navigation', async () => {
      await vi.advanceTimersByTimeAsync(300);

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      
      let results = document.querySelectorAll('.search-modal__result');
      expect(results[0].classList.contains('search-modal__result--selected')).toBe(true);
      
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      
      results = document.querySelectorAll('.search-modal__result');
      expect(results[0].classList.contains('search-modal__result--selected')).toBe(false);
      expect(results[1].classList.contains('search-modal__result--selected')).toBe(true);
    });
  });

  describe('Mouse Interaction', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should select result on click', async () => {
      const onSelect = vi.fn();
      const onSearch = vi.fn().mockResolvedValue(mockResults);
      modal = new SearchModal({ onSearch, onSelect });
      modal.open();

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('input'));

      await vi.advanceTimersByTimeAsync(300);

      const results = document.querySelectorAll('.search-modal__result');
      (results[1] as HTMLElement).click();

      expect(onSelect).toHaveBeenCalledWith(mockResults[1]);
      expect(modal.getState().isOpen).toBe(false);
    });

    it('should close on overlay click', () => {
      modal = new SearchModal();
      modal.open();

      const overlay = document.querySelector('.search-modal__overlay') as HTMLElement;
      overlay.click();

      expect(modal.getState().isOpen).toBe(false);
    });

    it('should not close on content click', () => {
      modal = new SearchModal();
      modal.open();

      const content = document.querySelector('.search-modal__content') as HTMLElement;
      content.click();

      expect(modal.getState().isOpen).toBe(true);
    });
  });

  describe('Focus Management', () => {
    it('should trap focus within modal', () => {
      modal = new SearchModal();
      modal.open();

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      input.focus();

      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      const modalElement = document.querySelector('.search-modal') as HTMLElement;
      modalElement.dispatchEvent(tabEvent);

      expect(document.activeElement).toBeTruthy();
    });

    it('should handle Shift+Tab for reverse focus trap', () => {
      modal = new SearchModal();
      modal.open();

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      input.focus();

      const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
      const modalElement = document.querySelector('.search-modal') as HTMLElement;
      modalElement.dispatchEvent(shiftTabEvent);

      expect(document.activeElement).toBeTruthy();
    });
  });

  describe('destroy()', () => {
    it('should remove modal from DOM', () => {
      modal = new SearchModal();
      expect(document.querySelector('.search-modal')).toBeTruthy();
      
      modal.destroy();
      
      expect(document.querySelector('.search-modal')).toBeFalsy();
    });

    it('should remove keyboard event listeners', () => {
      modal = new SearchModal();
      modal.destroy();

      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
      document.dispatchEvent(event);

      expect(document.querySelector('.search-modal')).toBeFalsy();
    });

    it('should close modal before destroying', () => {
      modal = new SearchModal();
      modal.open();
      
      expect(document.body.style.overflow).toBe('hidden');
      
      modal.destroy();
      
      expect(document.body.style.overflow).toBe('');
    });

    it('should clear debounce timer', () => {
      vi.useFakeTimers();
      const onSearch = vi.fn().mockResolvedValue(mockResults);
      modal = new SearchModal({ onSearch });
      modal.open();

      const input = document.querySelector('.search-modal__input') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('input'));

      modal.destroy();

      vi.advanceTimersByTime(300);

      expect(onSearch).not.toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe('getState()', () => {
    beforeEach(() => {
      modal = new SearchModal();
    });

    it('should return current state', () => {
      const state = modal.getState();
      expect(state).toHaveProperty('isOpen');
      expect(state).toHaveProperty('query');
      expect(state).toHaveProperty('results');
      expect(state).toHaveProperty('selectedIndex');
      expect(state).toHaveProperty('isSearching');
    });

    it('should return immutable state', () => {
      const state = modal.getState();
      const originalOpen = state.isOpen;
      (state as any).isOpen = !originalOpen;
      expect(modal.getState().isOpen).toBe(originalOpen);
    });
  });
});
