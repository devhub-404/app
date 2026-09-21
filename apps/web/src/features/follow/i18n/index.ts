import { catalog as ptUi } from './catalog/pt/ui';
import { catalog as enUi } from './catalog/en/ui';
import { catalog as esUi } from './catalog/es/ui';
import { createTranslator } from '@/shared/i18n/core';
import { createI18n } from '@/shared/i18n/core/solid';
export { type Locale } from '@/shared/i18n/core';

export const catalogs = { pt: { ...ptUi }, en: { ...enUi }, es: { ...esUi } } as const;
export const useI18n = createI18n(catalogs);
export const translate = createTranslator(catalogs);
export type TranslationKey = keyof typeof catalogs.en;
