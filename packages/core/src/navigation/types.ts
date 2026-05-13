export type ScrollDirection = 'up' | 'down' | 'none';

export interface NavigationOptions {
  mobileBreakpoint?: number;
  hideOnScroll?: boolean;
  scrollThreshold?: number;
  mobileMenuClass?: string;
  dropdownActiveClass?: string;
  hiddenClass?: string;
  bodyLockClass?: string;
}

export interface NavigationState {
  isMobileMenuOpen: boolean;
  activeDropdown: string | null;
  isHidden: boolean;
  isMobile: boolean;
  lastScrollY: number;
  scrollDirection: ScrollDirection;
}
