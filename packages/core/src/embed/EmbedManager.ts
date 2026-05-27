import type { EmbedPlatform, EmbedOptions } from './types';

const URL_BUILDERS: Record<EmbedPlatform, (opts: EmbedOptions) => string> = {
  youtube: (o) => `https://www.youtube.com/embed/${o.id}`,
  bilibili: (o) => `https://player.bilibili.com/player.html?bvid=${o.id}&autoplay=0`,
  vimeo: (o) => `https://player.vimeo.com/video/${o.id}`,
  codepen: (o) => `https://codepen.io/${o.user || 'anon'}/embed/${o.id}?default-tab=result`,
  twitter: (o) => `https://platform.twitter.com/embed/Tweet.html?id=${o.id}`,
  gist: (o) => `https://gist.github.com/${o.user || 'anonymous'}/${o.id}.js`,
};

export function getEmbedUrl(platform: EmbedPlatform, options: EmbedOptions): string {
  return URL_BUILDERS[platform](options);
}

export function getEmbedHtml(platform: EmbedPlatform, options: EmbedOptions): string {
  const url = getEmbedUrl(platform, options);
  if (platform === 'gist') {
    return `<script src="${url}"></script>`;
  }
  const aspect = platform === 'twitter' ? '' : ' style="aspect-ratio:16/9;width:100%"';
  return `<iframe src="${url}" frameborder="0" allowfullscreen${aspect}></iframe>`;
}
