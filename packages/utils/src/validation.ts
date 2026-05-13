/**
 * 类型守卫和验证函数
 * 提供类型安全的值验证和类型检查
 */

/**
 * 检查值是否为字符串
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * 检查值是否为数字
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * 检查值是否为布尔值
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 检查值是否为对象（不包括 null 和数组）
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 检查值是否为数组
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * 检查值是否为空
 * 空值包括：null, undefined, '', [], {}
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (isString(value)) {
    return value.length === 0;
  }

  if (isArray(value)) {
    return value.length === 0;
  }

  if (isObject(value)) {
    return Object.keys(value).length === 0;
  }

  return false;
}

/**
 * 验证邮箱格式
 * 简单验证：检查是否包含 @ 和 .
 */
export function isValidEmail(email: string): boolean {
  if (!isString(email)) {
    return false;
  }

  const trimmed = email.trim();
  const atIndex = trimmed.indexOf('@');
  const dotIndex = trimmed.lastIndexOf('.');

  return (
    atIndex > 0 &&
    dotIndex > atIndex + 1 &&
    dotIndex < trimmed.length - 1
  );
}

/**
 * 验证 URL 格式
 * 简单验证：检查是否以 http:// 或 https:// 开头
 */
export function isValidUrl(url: string): boolean {
  if (!isString(url)) {
    return false;
  }

  const trimmed = url.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}
