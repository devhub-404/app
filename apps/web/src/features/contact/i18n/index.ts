import { createTranslator } from '@/shared/i18n/core';
import { createI18n } from '@/shared/i18n/core/solid';
import { catalog as pt } from './catalog/pt/contact';
import { catalog as en } from './catalog/en/contact';
import { catalog as es } from './catalog/es/contact';

const catalogs = { pt, en, es } as const;

export const useI18n = createI18n(catalogs);
export const translate = createTranslator(catalogs);
export type TranslationKey = keyof typeof catalogs.en;
