import { catalog as ptLifecycle } from './catalog/pt/lifecycle';
import { catalog as ptPreferences } from './catalog/pt/preferences';
import { catalog as ptUi } from './catalog/pt/ui';
import { catalog as ptProfile } from './catalog/pt/profile';
import { catalog as enLifecycle } from './catalog/en/lifecycle';
import { catalog as enPreferences } from './catalog/en/preferences';
import { catalog as enUi } from './catalog/en/ui';
import { catalog as enProfile } from './catalog/en/profile';
import { catalog as esLifecycle } from './catalog/es/lifecycle';
import { catalog as esPreferences } from './catalog/es/preferences';
import { catalog as esUi } from './catalog/es/ui';
import { catalog as esProfile } from './catalog/es/profile';
import { createTranslator } from '@/shared/i18n/core';
import { createI18n } from '@/shared/i18n/core/solid';
export { localeFromRequest, localeToHtmlLang, type Locale } from '@/shared/i18n/core';

export const catalogs = {
  pt: {
    ...ptLifecycle,
    ...ptPreferences,
    ...ptUi,
    ...ptProfile,
  },
  en: {
    ...enLifecycle,
    ...enPreferences,
    ...enUi,
    ...enProfile,
  },
  es: {
    ...esLifecycle,
    ...esPreferences,
    ...esUi,
    ...esProfile,
  },
} as const;

export const useI18n = createI18n(catalogs);
export const translate = createTranslator(catalogs);
export type TranslationKey = keyof typeof catalogs.en;
export { applyLocale } from '@/shared/i18n/core/solid';
