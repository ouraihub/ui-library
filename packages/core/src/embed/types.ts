export type EmbedPlatform = 'youtube' | 'bilibili' | 'vimeo' | 'codepen' | 'twitter' | 'gist';

export interface EmbedOptions {
  id: string;
  user?: string;
}
