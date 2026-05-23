export interface SearchAdapterResult {
  url: string;
  title: string;
  excerpt: string;
}

export interface SearchOptions {
  /** Search provider */
  provider: 'pagefind' | 'custom';
  /** Custom search function (required for 'custom' provider) */
  searchFn?: (query: string) => Promise<SearchAdapterResult[]>;
  /** Pagefind base path. Default: '/pagefind/pagefind.js' */
  pagefindPath?: string;
}
