import { catalog as ptIndex } from './catalog/pt/index';
import { catalog as ptNotFound } from './catalog/pt/not-found';
import { catalog as ptServerError } from './catalog/pt/server-error';
import { catalog as ptPages } from './catalog/pt/pages';
import { catalog as ptUi } from './catalog/pt/ui';
import { catalog as enIndex } from './catalog/en/index';
import { catalog as enNotFound } from './catalog/en/not-found';
import { catalog as enServerError } from './catalog/en/server-error';
import { catalog as enPages } from './catalog/en/pages';
import { catalog as enUi } from './catalog/en/ui';
import { catalog as esIndex } from './catalog/es/index';
import { catalog as esNotFound } from './catalog/es/not-found';
import { catalog as esServerError } from './catalog/es/server-error';
import { catalog as esPages } from './catalog/es/pages';
import { catalog as esUi } from './catalog/es/ui';
import { createTranslator } from '@/shared/i18n/core';
import { createI18n } from '@/shared/i18n/core/solid';
export { localeFromRequest, localeToHtmlLang, type Locale } from '@/shared/i18n/core';

export const catalogs = {
  pt: {
    ...ptIndex,
    ...ptNotFound,
    ...ptServerError,
    ...ptPages,
    ...ptUi,
  },
  en: {
    ...enIndex,
    ...enNotFound,
    ...enServerError,
    ...enPages,
    ...enUi,
  },
  es: {
    ...esIndex,
    ...esNotFound,
    ...esServerError,
    ...esPages,
    ...esUi,
  },
} as const;

export const useI18n = createI18n(catalogs);
export const translate = createTranslator(catalogs);
export type TranslationKey = keyof typeof catalogs.en;
