/**
 * 格式化工具函数集合
 * 提供常见的字符串、数字、日期格式化功能
 */

/**
 * 格式化日期
 * @param date - 日期对象、ISO 字符串或时间戳
 * @param format - 格式字符串，默认 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: Date | string | number,
  format: string = 'YYYY-MM-DD'
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 格式化数字，添加千分位分隔符
 * @param num - 要格式化的数字
 * @param decimals - 小数位数，默认 0
 * @returns 格式化后的数字字符串
 */
export function formatNumber(num: number, decimals: number = 0): string {
  const fixed = num.toFixed(decimals);
  const [integerPart, decimalPart] = fixed.split('.');

  const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return decimalPart ? `${formatted}.${decimalPart}` : formatted;
}

/**
 * 截断字符串
 * @param str - 要截断的字符串
 * @param maxLength - 最大长度
 * @param suffix - 后缀，默认 '...'
 * @returns 截断后的字符串
 */
export function truncate(
  str: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (str.length <= maxLength) {
    return str;
  }

  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * 首字母大写
 * @param str - 要转换的字符串
 * @returns 首字母大写后的字符串
 */
export function capitalize(str: string): string {
  if (str.length === 0) {
    return str;
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 转换为 kebab-case
 * @param str - 要转换的字符串
 * @returns kebab-case 格式的字符串
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * 转换为 camelCase
 * @param str - 要转换的字符串
 * @returns camelCase 格式的字符串
 */
export function camelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^(.)/, (char) => char.toLowerCase());
}
