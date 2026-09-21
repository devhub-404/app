import {
  createComponent,
  createContext,
  createSignal,
  splitProps,
  useContext,
  type Accessor,
  type Component,
} from 'solid-js';
import { createTranslator, DEFAULT_LOCALE, LOCALE_COOKIE_NAME, type Locale } from '.';

const LocaleContext = createContext<Accessor<Locale>>();

function normalizeLocale(value: unknown, fallback: Locale): Locale {
  return value === 'en' || value === 'es' || value === 'pt' ? value : fallback;
}

function readDocumentLocale(initialLocale: Locale): Locale {
  if (typeof document === 'undefined') return initialLocale;
  return normalizeLocale(document.documentElement.dataset['locale'], initialLocale);
}

export function useLocale(initialLocale: Locale = DEFAULT_LOCALE) {
  const inherited = useContext(LocaleContext);
  if (inherited) return { locale: inherited };
  const [locale] = createSignal<Locale>(readDocumentLocale(initialLocale));
  return { locale };
}

export function readLocaleOverride(): Locale | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${LOCALE_COOKIE_NAME}=`;
  for (const entry of document.cookie.split(';')) {
    const value = entry.trim();
    if (!value.startsWith(prefix)) continue;
    try {
      const decoded = decodeURIComponent(value.slice(prefix.length));
      return decoded === 'pt' || decoded === 'en' || decoded === 'es' ? decoded : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function applyLocale(locale: Locale): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  document.documentElement.dataset['locale'] = locale;
}

export function clearLocaleOverride(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${LOCALE_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
}

export type LocaleBoundaryProps = { locale?: Locale };

export function withLocale<P extends object>(ComponentValue: Component<P>): Component<P & LocaleBoundaryProps> {
  return (props) => {
    const [local, rest] = splitProps(props as P & LocaleBoundaryProps, ['locale']);
    const inheritedLocale = useContext(LocaleContext)?.();
    const initialLocale = local.locale ?? inheritedLocale ?? readDocumentLocale(DEFAULT_LOCALE);
    const { locale } = useLocale(initialLocale);
    return createComponent(LocaleContext.Provider, {
      value: locale,
      get children() {
        return createComponent(ComponentValue, rest as P);
      },
    });
  };
}

export function createI18n<const Catalogs extends Record<Locale, Record<string, string>>>(catalogs: Catalogs) {
  type TranslationKey = keyof Catalogs['en'];
  const translate = createTranslator(catalogs);
  return function useI18n(initialLocale: Locale = DEFAULT_LOCALE) {
    const { locale } = useLocale(initialLocale);
    return {
      locale,
      t: (key: TranslationKey, values: readonly unknown[] = []) => translate(locale(), key, values),
    };
  };
}
