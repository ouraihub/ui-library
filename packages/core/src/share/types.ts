export type SharePlatform = 'twitter' | 'facebook' | 'linkedin' | 'telegram' | 'whatsapp' | 'reddit' | 'email';

export interface ShareLink {
  name: string;
  href: string;
  icon: string;
}
