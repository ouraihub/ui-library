/**
 * querySelector 封装 - 返回单个元素或 null
 * @param selector CSS 选择器
 * @param parent 父元素，默认为 document
 * @returns 匹配的元素或 null
 */
export function qs<T extends Element = Element>(
  selector: string,
  parent: Document | Element = document
): T | null {
  return parent.querySelector<T>(selector);
}

/**
 * querySelectorAll 封装 - 返回元素数组
 * @param selector CSS 选择器
 * @param parent 父元素，默认为 document
 * @returns 匹配的元素数组
 */
export function qsa<T extends Element = Element>(
  selector: string,
  parent: Document | Element = document
): T[] {
  return Array.from(parent.querySelectorAll<T>(selector));
}

/**
 * 类型守卫：检查元素是否存在
 * @param element 元素或 null
 * @returns 元素是否存在
 */
export function isElement<T extends Element>(element: T | null): element is T {
  return element !== null;
}

/**
 * 类型守卫：检查元素是否为 HTMLElement
 * @param element 元素
 * @returns 元素是否为 HTMLElement
 */
export function isHTMLElement(element: Element): element is HTMLElement {
  return element instanceof HTMLElement;
}
