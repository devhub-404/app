import { createI18n } from '@/shared/i18n/core/solid';
import { createTranslator } from '@/shared/i18n/core';
import { catalog as pt } from './catalog/pt/comments';
import { catalog as en } from './catalog/en/comments';
import { catalog as es } from './catalog/es/comments';

const catalogs = { pt, en, es } as const;
export const useI18n = createI18n(catalogs);
export const translate = createTranslator(catalogs);
export type TranslationKey = keyof typeof catalogs.en;
