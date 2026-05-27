export interface CodeCopyOptions {
  /** Selector for code blocks. Default: 'pre' */
  selector?: string;
  /** Button text before copy. Default: 'Copy' */
  buttonLabel?: string;
  /** Button text after copy. Default: 'Copied!' */
  copiedLabel?: string;
  /** Time to show copied state (ms). Default: 2000 */
  copiedTimeout?: number;
  /** CSS class for the button. Default: 'code-copy-btn' */
  buttonClass?: string;
}
