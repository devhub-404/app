import { createTranslator } from '@/shared/i18n/core';
import { createI18n } from '@/shared/i18n/core/solid';
import { catalog as en } from './catalog/en/ui';
import { catalog as es } from './catalog/es/ui';
import { catalog as pt } from './catalog/pt/ui';

const catalogs = { en, es, pt } as const;
export const useI18n = createI18n(catalogs);
export const translate = createTranslator(catalogs);
export type TranslationKey = keyof typeof en;
