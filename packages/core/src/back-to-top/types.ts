export interface BackToTopOptions {
  /** Scroll threshold to show (0-1). Default: 0.3 */
  threshold?: number;
  /** Smooth scroll. Default: true */
  smooth?: boolean;
  /** Called when button should show */
  onShow?: () => void;
  /** Called when button should hide */
  onHide?: () => void;
}
