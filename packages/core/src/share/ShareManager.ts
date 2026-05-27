import type { SharePlatform, ShareLink } from './types';

const PLATFORMS: Record<SharePlatform, (url: string, title: string) => ShareLink> = {
  twitter: (url, title) => ({ name: 'Twitter', icon: 'twitter', href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}` }),
  facebook: (url) => ({ name: 'Facebook', icon: 'facebook', href: `https://www.facebook.com/sharer.php?u=${enc(url)}` }),
  linkedin: (url, title) => ({ name: 'LinkedIn', icon: 'linkedin', href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}&title=${enc(title)}` }),
  telegram: (url, title) => ({ name: 'Telegram', icon: 'telegram', href: `https://t.me/share/url?url=${enc(url)}&text=${enc(title)}` }),
  whatsapp: (url, title) => ({ name: 'WhatsApp', icon: 'whatsapp', href: `https://wa.me/?text=${enc(title + ' ' + url)}` }),
  reddit: (url, title) => ({ name: 'Reddit', icon: 'reddit', href: `https://reddit.com/submit?url=${enc(url)}&title=${enc(title)}` }),
  email: (url, title) => ({ name: 'Email', icon: 'email', href: `mailto:?subject=${enc(title)}&body=${enc(url)}` }),
};

const DEFAULT_PLATFORMS: SharePlatform[] = ['twitter', 'facebook', 'linkedin', 'telegram', 'whatsapp'];

function enc(s: string): string { return encodeURIComponent(s); }

export function getShareLinks(url: string, title: string, platforms?: SharePlatform[]): ShareLink[] {
  return (platforms || DEFAULT_PLATFORMS).map((p) => PLATFORMS[p](url, title));
}

export async function copyLink(url: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
  try { await navigator.clipboard.writeText(url); return true; } catch { return false; }
}
