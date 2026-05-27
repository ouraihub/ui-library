export interface TerminalPlayerOptions {
  /** Cast file URL or local path */
  src: string;
  /** Columns. Default: 80 */
  cols?: number;
  /** Rows. Default: 24 */
  rows?: number;
  /** Autoplay. Default: false */
  autoplay?: boolean;
  /** Preload. Default: false */
  preload?: boolean;
  /** Loop. Default: false */
  loop?: boolean;
  /** Playback speed. Default: 1 */
  speed?: number;
  /** Start at (seconds). Default: 0 */
  startAt?: number;
  /** Max idle time (seconds) */
  idleTimeLimit?: number;
  /** Poster: 'npt:1:23' or 'data:text/plain,...' */
  poster?: string;
  /** Fit mode: 'width' | 'height' | 'both' | 'none'. Default: 'width' */
  fit?: 'width' | 'height' | 'both' | 'none';
  /** Theme: 'asciinema' | 'monokai' | 'tango' | 'solarized-dark' | 'solarized-light' */
  theme?: string;
  /** Title shown in player */
  title?: string;
  /** CDN base for asciinema-player assets */
  cdnBase?: string;
}
