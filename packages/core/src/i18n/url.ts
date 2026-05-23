import type { I18nUrlOptions } from './types';

export function getLocalizedUrl(url: string, targetLocale: string, options: I18nUrlOptions): string {
  const { strategy, defaultLocale, domains } = options;
  const path = stripLocalePrefix(url, options);

  switch (strategy) {
    case 'prefix':
      return `/${targetLocale}${path}`;
    case 'prefix_except_default':
      return targetLocale === defaultLocale ? path : `/${targetLocale}${path}`;
    case 'domain':
      const domain = domains?.[targetLocale] || '';
      return domain ? `https://${domain}${path}` : path;
  }
}

export function getCurrentLocale(url: string, options: I18nUrlOptions): string {
  const { strategy, defaultLocale, locales, domains } = options;

  if (strategy === 'domain' && domains) {
    for (const [locale, domain] of Object.entries(domains)) {
      if (url.includes(domain)) return locale;
    }
    return defaultLocale;
  }

  // prefix or prefix_except_default
  const match = url.match(/^\/([a-z]{2}(?:-[a-z]{2})?)(\/|$)/i);
  if (match && locales.includes(match[1])) return match[1];
  return defaultLocale;
}

export function getAlternateUrls(url: string, options: I18nUrlOptions): { locale: string; url: string }[] {
  return options.locales.map((locale) => ({
    locale,
    url: getLocalizedUrl(url, locale, options),
  }));
}

function stripLocalePrefix(url: string, options: I18nUrlOptions): string {
  for (const locale of options.locales) {
    if (url.startsWith(`/${locale}/`)) return url.slice(locale.length + 1);
    if (url === `/${locale}`) return '/';
  }
  return url.startsWith('/') ? url : `/${url}`;
}
