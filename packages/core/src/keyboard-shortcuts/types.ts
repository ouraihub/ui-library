export interface Shortcut {
  /** Key combo: 'ctrl+k', 'escape', '/', 'shift+?' */
  key: string;
  handler: () => void;
  /** Description for help panel */
  description?: string;
}
