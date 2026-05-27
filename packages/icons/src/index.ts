import { SOCIAL_ICONS } from './social';
import { UI_ICONS } from './ui';

export const ICONS = { ...SOCIAL_ICONS, ...UI_ICONS } as const;
export type IconName = keyof typeof ICONS;

export function getIconPath(name: IconName): string {
  return ICONS[name];
}

export { SOCIAL_ICONS, UI_ICONS };
export type { SocialIconName } from './social';
export type { UIIconName } from './ui';
