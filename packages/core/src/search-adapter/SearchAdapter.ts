import type { SearchOptions, SearchAdapterResult } from './types';

export class SearchAdapter {
  private opts: SearchOptions;
  private pagefind: any = null;

  constructor(options: SearchOptions) {
    this.opts = options;
  }

  async init(): Promise<boolean> {
    if (this.opts.provider === 'pagefind') {
      try {
        const path = this.opts.pagefindPath || '/pagefind/pagefind.js';
        this.pagefind = await import(/* @vite-ignore */ path);
        return true;
      } catch { return false; }
    }
    return true;
  }

  async search(query: string): Promise<SearchAdapterResult[]> {
    if (!query.trim()) return [];

    if (this.opts.provider === 'custom' && this.opts.searchFn) {
      return this.opts.searchFn(query);
    }

    if (this.opts.provider === 'pagefind' && this.pagefind) {
      const search = await this.pagefind.search(query);
      const results: SearchAdapterResult[] = [];
      for (const result of search.results.slice(0, 10)) {
        const data = await result.data();
        results.push({ url: data.url, title: data.meta?.title || '', excerpt: data.excerpt || '' });
      }
      return results;
    }

    return [];
  }
}
