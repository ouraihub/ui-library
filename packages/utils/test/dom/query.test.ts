import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { qs, qsa, isElement, isHTMLElement } from '../../src/dom/query';

describe('DOM Query Tools', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    container.innerHTML = `
      <div class="item" id="item-1">Item 1</div>
      <div class="item" id="item-2">Item 2</div>
      <div class="item" id="item-3">Item 3</div>
      <span class="label">Label</span>
      <button class="btn">Button</button>
    `;
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('qs()', () => {
    it('应该找到匹配的元素', () => {
      const element = qs('.item');
      expect(element).not.toBeNull();
      expect(element?.id).toBe('item-1');
    });

    it('未找到元素时应该返回 null', () => {
      const element = qs('.non-existent');
      expect(element).toBeNull();
    });

    it('应该支持自定义父元素', () => {
      const element = qs('.item', container);
      expect(element).not.toBeNull();
      expect(element?.id).toBe('item-1');
    });

    it('应该在自定义父元素中未找到时返回 null', () => {
      const otherContainer = document.createElement('div');
      document.body.appendChild(otherContainer);
      
      const element = qs('.item', otherContainer);
      expect(element).toBeNull();
      
      document.body.removeChild(otherContainer);
    });

    it('应该支持复杂选择器', () => {
      const element = qs('div.item#item-2');
      expect(element?.id).toBe('item-2');
    });

    it('应该返回第一个匹配的元素', () => {
      const element = qs('.item');
      expect(element?.id).toBe('item-1');
    });
  });

  describe('qsa()', () => {
    it('应该返回所有匹配的元素数组', () => {
      const elements = qsa('.item');
      expect(elements).toHaveLength(3);
      expect(elements[0].id).toBe('item-1');
      expect(elements[1].id).toBe('item-2');
      expect(elements[2].id).toBe('item-3');
    });

    it('未找到元素时应该返回空数组', () => {
      const elements = qsa('.non-existent');
      expect(elements).toEqual([]);
      expect(elements).toHaveLength(0);
    });

    it('应该支持自定义父元素', () => {
      const elements = qsa('.item', container);
      expect(elements).toHaveLength(3);
    });

    it('应该在自定义父元素中未找到时返回空数组', () => {
      const otherContainer = document.createElement('div');
      document.body.appendChild(otherContainer);
      
      const elements = qsa('.item', otherContainer);
      expect(elements).toEqual([]);
      
      document.body.removeChild(otherContainer);
    });

    it('应该返回数组而不是 NodeList', () => {
      const elements = qsa('.item');
      expect(Array.isArray(elements)).toBe(true);
    });

    it('应该支持复杂选择器', () => {
      const elements = qsa('div.item');
      expect(elements).toHaveLength(3);
    });

    it('应该支持多个选择器', () => {
      const elements = qsa('.item, .label, .btn');
      expect(elements).toHaveLength(5);
    });
  });

  describe('isElement()', () => {
    it('应该在元素存在时返回 true', () => {
      const element = qs('.item');
      expect(isElement(element)).toBe(true);
    });

    it('应该在元素为 null 时返回 false', () => {
      const element = qs('.non-existent');
      expect(isElement(element)).toBe(false);
    });

    it('应该作为类型守卫工作', () => {
      const element = qs('.item');
      if (isElement(element)) {
        expect(element.id).toBe('item-1');
      }
    });

    it('应该对真实元素返回 true', () => {
      const div = document.createElement('div');
      expect(isElement(div)).toBe(true);
    });

    it('应该对 null 返回 false', () => {
      expect(isElement(null)).toBe(false);
    });
  });

  describe('isHTMLElement()', () => {
    it('应该对 HTMLElement 返回 true', () => {
      const element = qs('.item') as Element;
      expect(isHTMLElement(element)).toBe(true);
    });

    it('应该对 div 返回 true', () => {
      const div = document.createElement('div');
      expect(isHTMLElement(div)).toBe(true);
    });

    it('应该对 button 返回 true', () => {
      const button = qs('.btn') as Element;
      expect(isHTMLElement(button)).toBe(true);
    });

    it('应该对 span 返回 true', () => {
      const span = qs('.label') as Element;
      expect(isHTMLElement(span)).toBe(true);
    });

    it('应该作为类型守卫工作', () => {
      const element = qs('.item') as Element;
      if (isHTMLElement(element)) {
        expect(element.className).toBeDefined();
      }
    });
  });
});
