import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatNumber,
  truncate,
  capitalize,
  kebabCase,
  camelCase
} from '../src/formatters';

describe('Formatter Functions', () => {
  describe('formatDate()', () => {
    it('应该格式化 Date 对象', () => {
      const date = new Date('2026-05-12');
      expect(formatDate(date)).toBe('2026-05-12');
    });

    it('应该格式化 ISO 字符串', () => {
      expect(formatDate('2026-05-12')).toBe('2026-05-12');
    });

    it('应该格式化时间戳', () => {
      const timestamp = new Date('2026-05-12').getTime();
      expect(formatDate(timestamp)).toBe('2026-05-12');
    });

    it('应该支持自定义格式 YYYY-MM-DD HH:mm:ss', () => {
      const date = new Date('2026-05-12T14:30:45');
      expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2026-05-12 14:30:45');
    });

    it('应该支持自定义格式 DD/MM/YYYY', () => {
      const date = new Date('2026-05-12');
      expect(formatDate(date, 'DD/MM/YYYY')).toBe('12/05/2026');
    });

    it('应该支持自定义格式 MM-DD-YYYY', () => {
      const date = new Date('2026-05-12');
      expect(formatDate(date, 'MM-DD-YYYY')).toBe('05-12-2026');
    });

    it('应该支持仅时间格式 HH:mm:ss', () => {
      const date = new Date('2026-05-12T14:30:45');
      expect(formatDate(date, 'HH:mm:ss')).toBe('14:30:45');
    });

    it('应该对无效日期返回空字符串', () => {
      expect(formatDate('invalid')).toBe('');
      expect(formatDate(NaN)).toBe('');
    });

    it('应该填充单位数月份和日期', () => {
      const date = new Date('2026-01-05');
      expect(formatDate(date)).toBe('2026-01-05');
    });

    it('应该填充单位数小时、分钟和秒', () => {
      const date = new Date('2026-05-12T09:05:03');
      expect(formatDate(date, 'HH:mm:ss')).toBe('09:05:03');
    });
  });

  describe('formatNumber()', () => {
    it('应该添加千分位分隔符', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(123456789)).toBe('123,456,789');
    });

    it('应该处理小数位', () => {
      expect(formatNumber(1234.5, 2)).toBe('1,234.50');
      expect(formatNumber(1000.123, 2)).toBe('1,000.12');
    });

    it('应该处理零', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(0, 2)).toBe('0.00');
    });

    it('应该处理负数', () => {
      expect(formatNumber(-1000)).toBe('-1,000');
      expect(formatNumber(-1234.5, 2)).toBe('-1,234.50');
    });

    it('应该处理小于 1000 的数字', () => {
      expect(formatNumber(999)).toBe('999');
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(1)).toBe('1');
    });

    it('应该支持不同的小数位数', () => {
      expect(formatNumber(1234.56789, 0)).toBe('1,235');
      expect(formatNumber(1234.56789, 1)).toBe('1,234.6');
      expect(formatNumber(1234.56789, 3)).toBe('1,234.568');
    });

    it('应该处理非常大的数字', () => {
      expect(formatNumber(1234567890)).toBe('1,234,567,890');
    });

    it('应该处理小数', () => {
      expect(formatNumber(0.5)).toBe('1');
      expect(formatNumber(0.5, 2)).toBe('0.50');
    });
  });

  describe('truncate()', () => {
    it('应该截断超长字符串', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...');
    });

    it('应该不截断短字符串', () => {
      expect(truncate('Hi', 10)).toBe('Hi');
    });

    it('应该支持自定义后缀', () => {
      expect(truncate('Hello World', 8, '→')).toBe('Hello W→');
    });

    it('应该支持空后缀', () => {
      expect(truncate('Hello World', 5, '')).toBe('Hello');
    });

    it('应该处理恰好等于最大长度的字符串', () => {
      expect(truncate('Hello', 5)).toBe('Hello');
    });

    it('应该处理长后缀', () => {
      expect(truncate('Hello World', 10, '...')).toBe('Hello W...');
    });

    it('应该处理空字符串', () => {
      expect(truncate('', 10)).toBe('');
    });

    it('应该处理单个字符', () => {
      expect(truncate('a', 1)).toBe('a');
      expect(truncate('ab', 1)).toBe('...');
    });

    it('应该处理中文字符', () => {
      expect(truncate('你好世界', 4)).toBe('你好世界');
    });
  });

  describe('capitalize()', () => {
    it('应该将首字母大写', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
    });

    it('应该保留其他字母的大小写', () => {
      expect(capitalize('hELLO')).toBe('HELLO');
      expect(capitalize('wORLD')).toBe('WORLD');
    });

    it('应该处理已大写的字符串', () => {
      expect(capitalize('Hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('HELLO');
    });

    it('应该处理空字符串', () => {
      expect(capitalize('')).toBe('');
    });

    it('应该处理单个字符', () => {
      expect(capitalize('a')).toBe('A');
      expect(capitalize('A')).toBe('A');
    });

    it('应该处理数字开头的字符串', () => {
      expect(capitalize('123abc')).toBe('123abc');
    });

    it('应该处理特殊字符开头的字符串', () => {
      expect(capitalize('!hello')).toBe('!hello');
    });

    it('应该处理中文字符', () => {
      expect(capitalize('你好')).toBe('你好');
    });
  });

  describe('kebabCase()', () => {
    it('应该转换 camelCase 为 kebab-case', () => {
      expect(kebabCase('helloWorld')).toBe('hello-world');
      expect(kebabCase('myVariableName')).toBe('my-variable-name');
    });

    it('应该转换 snake_case 为 kebab-case', () => {
      expect(kebabCase('hello_world')).toBe('hello-world');
      expect(kebabCase('my_variable_name')).toBe('my-variable-name');
    });

    it('应该转换空格为连字符', () => {
      expect(kebabCase('hello world')).toBe('hello-world');
      expect(kebabCase('my variable name')).toBe('my-variable-name');
    });

    it('应该转换为小写', () => {
      expect(kebabCase('HelloWorld')).toBe('hello-world');
      expect(kebabCase('HELLO_WORLD')).toBe('hello-world');
    });

    it('应该处理混合格式', () => {
      expect(kebabCase('hello_World Name')).toBe('hello-world-name');
    });

    it('应该处理已是 kebab-case 的字符串', () => {
      expect(kebabCase('hello-world')).toBe('hello-world');
    });

    it('应该处理单个单词', () => {
      expect(kebabCase('hello')).toBe('hello');
    });

    it('应该处理空字符串', () => {
      expect(kebabCase('')).toBe('');
    });

    it('应该处理连续的分隔符', () => {
      expect(kebabCase('hello__world')).toBe('hello-world');
      expect(kebabCase('hello  world')).toBe('hello-world');
    });
  });

  describe('camelCase()', () => {
    it('应该转换 kebab-case 为 camelCase', () => {
      expect(camelCase('hello-world')).toBe('helloWorld');
      expect(camelCase('my-variable-name')).toBe('myVariableName');
    });

    it('应该转换 snake_case 为 camelCase', () => {
      expect(camelCase('hello_world')).toBe('helloWorld');
      expect(camelCase('my_variable_name')).toBe('myVariableName');
    });

    it('应该转换空格为 camelCase', () => {
      expect(camelCase('hello world')).toBe('helloWorld');
      expect(camelCase('my variable name')).toBe('myVariableName');
    });

    it('应该转换为小写开头', () => {
      expect(camelCase('HelloWorld')).toBe('helloWorld');
      expect(camelCase('HELLO_WORLD')).toBe('hELLOWORLD');
    });

    it('应该处理混合格式', () => {
      expect(camelCase('hello-World_Name')).toBe('helloWorldName');
    });

    it('应该处理已是 camelCase 的字符串', () => {
      expect(camelCase('helloWorld')).toBe('helloWorld');
    });

    it('应该处理单个单词', () => {
      expect(camelCase('hello')).toBe('hello');
    });

    it('应该处理空字符串', () => {
      expect(camelCase('')).toBe('');
    });

    it('应该处理连续的分隔符', () => {
      expect(camelCase('hello__world')).toBe('helloWorld');
      expect(camelCase('hello  world')).toBe('helloWorld');
    });

    it('应该处理大写开头的单词', () => {
      expect(camelCase('Hello-World')).toBe('helloWorld');
    });
  });
});
