import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { SearchOptions } from '@ouraihub/core';

export interface Props {
  options?: SearchOptions;
  placeholder?: string;
  class?: string;
}

declare const Search: AstroComponentFactory;
export default Search;
