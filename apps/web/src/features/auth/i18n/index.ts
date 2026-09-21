import { catalog as pt } from './catalog/pt/auth';
import { catalog as en } from './catalog/en/auth';
import { catalog as es } from './catalog/es/auth';
import { createI18n } from '@/shared/i18n/core/solid';
export { localeFromRequest, localeToHtmlLang } from '@/shared/i18n/core';

const catalogs = { pt, en, es } as const;
export const useI18n = createI18n(catalogs);
export type TranslationKey = keyof typeof pt;
export function translate(locale: keyof typeof catalogs, key: TranslationKey): string {
  return catalogs[locale][key] ?? catalogs.pt[key] ?? String(key);
}
