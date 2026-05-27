export interface ReadingProgressOptions {
  /** Content element selector for height calculation. Default: 'article' */
  contentSelector?: string;
  /** Progress callback (0-1). UI layer uses this to update progress bar width. */
  onProgress?: (percent: number) => void;
}
