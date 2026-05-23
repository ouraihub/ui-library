import type { Shortcut } from './types';

export class KeyboardShortcuts {
  private shortcuts: Map<string, Shortcut> = new Map();
  private listener: ((e: KeyboardEvent) => void) | null = null;

  constructor() {
    if (typeof window === 'undefined') return;
    this.listener = (e) => this.handle(e);
    document.addEventListener('keydown', this.listener);
  }

  register(shortcut: Shortcut): void {
    this.shortcuts.set(shortcut.key.toLowerCase(), shortcut);
  }

  unregister(key: string): void {
    this.shortcuts.delete(key.toLowerCase());
  }

  getAll(): Shortcut[] {
    return [...this.shortcuts.values()];
  }

  destroy(): void {
    if (this.listener) document.removeEventListener('keydown', this.listener);
    this.shortcuts.clear();
  }

  private handle(e: KeyboardEvent): void {
    // Skip if user is typing in an input
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    const combo = this.toCombo(e);
    const shortcut = this.shortcuts.get(combo);
    if (shortcut) {
      e.preventDefault();
      shortcut.handler();
    }
  }

  private toCombo(e: KeyboardEvent): string {
    const parts: string[] = [];
    if (e.ctrlKey || e.metaKey) parts.push('ctrl');
    if (e.shiftKey) parts.push('shift');
    if (e.altKey) parts.push('alt');
    const key = e.key.toLowerCase();
    if (!['control', 'meta', 'shift', 'alt'].includes(key)) parts.push(key);
    return parts.join('+');
  }
}
