import type { CommentConfig } from '@ouraihub/core';

/**
 * Component Registry — the single source of truth for the contract
 * between Hugo partials (HTML) and client-side TypeScript.
 *
 * Rules:
 * 1. Every component MUST be declared here before use.
 * 2. Hugo partials MUST render `data-controller="<key>"`.
 * 3. Config is passed via `data-<key>-<prop>` attributes on the same element.
 * 4. Complex config (objects) uses a child `<script type="application/json">`.
 */
export interface ComponentRegistry {
  'back-to-top': { threshold?: number };
  'reading-progress': Record<string, never>;
  'toc': Record<string, never>;
  'code-copy': { selector?: string };
  'comments': Partial<CommentConfig>;
}

export type ComponentName = keyof ComponentRegistry;

/**
 * Find all elements with `data-controller="name"` and invoke the initializer.
 * Returns the count of initialized instances.
 */
export function initComponents<K extends ComponentName>(
  name: K,
  init: (el: HTMLElement, config: ComponentRegistry[K]) => void,
): number {
  const elements = document.querySelectorAll<HTMLElement>(`[data-controller="${name}"]`);
  elements.forEach((el) => {
    const config = parseConfig<ComponentRegistry[K]>(el, name);
    init(el, config);
  });
  return elements.length;
}

/**
 * Parse config from data attributes or embedded JSON script.
 */
function parseConfig<T>(el: HTMLElement, name: string): T {
  // Try embedded JSON first (for complex configs like comments)
  const jsonScript = el.querySelector<HTMLScriptElement>('script[type="application/json"]');
  if (jsonScript?.textContent?.trim()) {
    try { return JSON.parse(jsonScript.textContent) as T; } catch { /* fall through */ }
  }

  // Parse simple data-<name>-<prop> attributes
  const prefix = `data-${name}-`;
  const config: Record<string, unknown> = {};
  for (const attr of Array.from(el.attributes)) {
    if (attr.name.startsWith(prefix)) {
      const key = attr.name.slice(prefix.length).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      config[key] = coerce(attr.value);
    }
  }
  return config as T;
}

/**
 * Coerce string attribute values to appropriate JS types.
 * Only coerces explicit boolean literals and numeric values that look intentional.
 */
function coerce(value: string): unknown {
  if (value === 'true') return true;
  if (value === 'false') return false;
  // Only coerce to number if it looks like a deliberate numeric value
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}
