export type LocaleStrategy = 'prefix' | 'prefix_except_default' | 'domain';

export interface I18nUrlOptions {
  strategy: LocaleStrategy;
  defaultLocale: string;
  locales: string[];
  domains?: Record<string, string>;
}
