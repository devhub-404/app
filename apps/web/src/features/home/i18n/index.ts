import { catalog as ptAbout } from './catalog/pt/about';
import { catalog as ptContent } from './catalog/pt/content';
import { catalog as ptContribute } from './catalog/pt/contribute';
import { catalog as ptGuidelines } from './catalog/pt/guidelines';
import { catalog as ptFaq } from './catalog/pt/faq';
import { catalog as ptHome } from './catalog/pt/home';
import { catalog as ptLegal } from './catalog/pt/legal';
import { catalog as ptSearch } from './catalog/pt/search';
import { catalog as ptSupport } from './catalog/pt/support';
import { catalog as ptUi } from './catalog/pt/ui';
import { catalog as enAbout } from './catalog/en/about';
import { catalog as enContent } from './catalog/en/content';
import { catalog as enContribute } from './catalog/en/contribute';
import { catalog as enGuidelines } from './catalog/en/guidelines';
import { catalog as enFaq } from './catalog/en/faq';
import { catalog as enHome } from './catalog/en/home';
import { catalog as enLegal } from './catalog/en/legal';
import { catalog as enSearch } from './catalog/en/search';
import { catalog as enSupport } from './catalog/en/support';
import { catalog as enUi } from './catalog/en/ui';
import { catalog as esAbout } from './catalog/es/about';
import { catalog as esContent } from './catalog/es/content';
import { catalog as esContribute } from './catalog/es/contribute';
import { catalog as esGuidelines } from './catalog/es/guidelines';
import { catalog as esFaq } from './catalog/es/faq';
import { catalog as esHome } from './catalog/es/home';
import { catalog as esLegal } from './catalog/es/legal';
import { catalog as esSearch } from './catalog/es/search';
import { catalog as esSupport } from './catalog/es/support';
import { catalog as esUi } from './catalog/es/ui';
import { createTranslator } from '@/shared/i18n/core';
import { createI18n } from '@/shared/i18n/core/solid';
export { localeFromRequest, localeToHtmlLang, type Locale } from '@/shared/i18n/core';

export const catalogs = {
  pt: {
    ...ptAbout,
    ...ptContent,
    ...ptContribute,
    ...ptGuidelines,
    ...ptFaq,
    ...ptHome,
    ...ptLegal,
    ...ptSearch,
    ...ptSupport,
    ...ptUi,
  },
  en: {
    ...enAbout,
    ...enContent,
    ...enContribute,
    ...enGuidelines,
    ...enFaq,
    ...enHome,
    ...enLegal,
    ...enSearch,
    ...enSupport,
    ...enUi,
  },
  es: {
    ...esAbout,
    ...esContent,
    ...esContribute,
    ...esGuidelines,
    ...esFaq,
    ...esHome,
    ...esLegal,
    ...esSearch,
    ...esSupport,
    ...esUi,
  },
} as const;

export const useI18n = createI18n(catalogs);
export const translate = createTranslator(catalogs);
export type TranslationKey = keyof typeof catalogs.en;
