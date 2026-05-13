import { describe, it, expect } from 'vitest';
import {
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isEmpty,
  isValidEmail,
  isValidUrl
} from '../src/validation';

describe('Validation Functions', () => {
  describe('isString()', () => {
    it('应该对字符串返回 true', () => {
      expect(isString('hello')).toBe(true);
      expect(isString('')).toBe(true);
      expect(isString('123')).toBe(true);
    });

    it('应该对非字符串返回 false', () => {
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
      expect(isString([])).toBe(false);
      expect(isString({})).toBe(false);
      expect(isString(true)).toBe(false);
    });

    it('应该作为类型守卫工作', () => {
      const value: unknown = 'test';
      if (isString(value)) {
        expect(value.toUpperCase()).toBe('TEST');
      }
    });
  });

  describe('isNumber()', () => {
    it('应该对数字返回 true', () => {
      expect(isNumber(0)).toBe(true);
      expect(isNumber(123)).toBe(true);
      expect(isNumber(-456)).toBe(true);
      expect(isNumber(3.14)).toBe(true);
    });

    it('应该对 NaN 返回 false', () => {
      expect(isNumber(NaN)).toBe(false);
    });

    it('应该对非数字返回 false', () => {
      expect(isNumber('123')).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
      expect(isNumber([])).toBe(false);
      expect(isNumber({})).toBe(false);
      expect(isNumber(true)).toBe(false);
    });

    it('应该作为类型守卫工作', () => {
      const value: unknown = 42;
      if (isNumber(value)) {
        expect(value + 1).toBe(43);
      }
    });
  });

  describe('isBoolean()', () => {
    it('应该对布尔值返回 true', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
    });

    it('应该对非布尔值返回 false', () => {
      expect(isBoolean(1)).toBe(false);
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean('true')).toBe(false);
      expect(isBoolean(null)).toBe(false);
      expect(isBoolean(undefined)).toBe(false);
      expect(isBoolean([])).toBe(false);
      expect(isBoolean({})).toBe(false);
    });

    it('应该作为类型守卫工作', () => {
      const value: unknown = true;
      if (isBoolean(value)) {
        expect(!value).toBe(false);
      }
    });
  });

  describe('isObject()', () => {
    it('应该对对象返回 true', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ key: 'value' })).toBe(true);
      expect(isObject({ a: 1, b: 2 })).toBe(true);
    });

    it('应该对数组返回 false', () => {
      expect(isObject([])).toBe(false);
      expect(isObject([1, 2, 3])).toBe(false);
    });

    it('应该对 null 返回 false', () => {
      expect(isObject(null)).toBe(false);
    });

    it('应该对非对象返回 false', () => {
      expect(isObject('string')).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject(true)).toBe(false);
      expect(isObject(undefined)).toBe(false);
    });

    it('应该作为类型守卫工作', () => {
      const value: unknown = { key: 'value' };
      if (isObject(value)) {
        expect(value.key).toBe('value');
      }
    });
  });

  describe('isArray()', () => {
    it('应该对数组返回 true', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray(['a', 'b'])).toBe(true);
    });

    it('应该对对象返回 false', () => {
      expect(isArray({})).toBe(false);
      expect(isArray({ length: 0 })).toBe(false);
    });

    it('应该对非数组返回 false', () => {
      expect(isArray('string')).toBe(false);
      expect(isArray(123)).toBe(false);
      expect(isArray(true)).toBe(false);
      expect(isArray(null)).toBe(false);
      expect(isArray(undefined)).toBe(false);
    });

    it('应该作为类型守卫工作', () => {
      const value: unknown = [1, 2, 3];
      if (isArray(value)) {
        expect(value.length).toBe(3);
      }
    });
  });

  describe('isEmpty()', () => {
    it('应该对 null 返回 true', () => {
      expect(isEmpty(null)).toBe(true);
    });

    it('应该对 undefined 返回 true', () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it('应该对空字符串返回 true', () => {
      expect(isEmpty('')).toBe(true);
    });

    it('应该对空数组返回 true', () => {
      expect(isEmpty([])).toBe(true);
    });

    it('应该对空对象返回 true', () => {
      expect(isEmpty({})).toBe(true);
    });

    it('应该对非空字符串返回 false', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty(' ')).toBe(false);
    });

    it('应该对非空数组返回 false', () => {
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty([''])).toBe(false);
    });

    it('应该对非空对象返回 false', () => {
      expect(isEmpty({ key: 'value' })).toBe(false);
      expect(isEmpty({ key: '' })).toBe(false);
    });

    it('应该对数字返回 false', () => {
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(123)).toBe(false);
    });

    it('应该对布尔值返回 false', () => {
      expect(isEmpty(true)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });
  });

  describe('isValidEmail()', () => {
    it('应该对有效邮箱返回 true', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.email@domain.co.uk')).toBe(true);
      expect(isValidEmail('a@b.c')).toBe(true);
    });

    it('应该对无效邮箱返回 false', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('invalid@domain')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('user@domain.')).toBe(false);
    });

    it('应该处理空格', () => {
      expect(isValidEmail('  user@example.com  ')).toBe(true);
      expect(isValidEmail('  invalid  ')).toBe(false);
    });

    it('应该对非字符串返回 false', () => {
      expect(isValidEmail(123 as any)).toBe(false);
      expect(isValidEmail(null as any)).toBe(false);
      expect(isValidEmail(undefined as any)).toBe(false);
    });

    it('应该对多个 @ 符号返回 false', () => {
      expect(isValidEmail('user@example@com')).toBe(false);
    });

    it('应该对 @ 在末尾返回 false', () => {
      expect(isValidEmail('user@')).toBe(false);
    });
  });

  describe('isValidUrl()', () => {
    it('应该对有效 URL 返回 true', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
    });

    it('应该对无效 URL 返回 false', () => {
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('invalid')).toBe(false);
      expect(isValidUrl('/path/to/file')).toBe(false);
    });

    it('应该处理空格', () => {
      expect(isValidUrl('  https://example.com  ')).toBe(true);
      expect(isValidUrl('  invalid  ')).toBe(false);
    });

    it('应该对非字符串返回 false', () => {
      expect(isValidUrl(123 as any)).toBe(false);
      expect(isValidUrl(null as any)).toBe(false);
      expect(isValidUrl(undefined as any)).toBe(false);
    });

    it('应该区分 http 和 https', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com')).toBe(true);
    });

    it('应该对空字符串返回 false', () => {
      expect(isValidUrl('')).toBe(false);
    });
  });
});
