export const locales = ['pt', 'en', 'es'] as const;
export type Locale = (typeof locales)[number];

export const DEFAULT_LOCALE: Locale = 'en';

function normalizeLanguageTag(value: string): Locale | null {
  const primary = value.trim().toLowerCase().split('-')[0];
  return primary === 'pt' || primary === 'en' || primary === 'es' ? primary : null;
}

function normalizeHeaderLanguageTag(value: string): Exclude<Locale, 'en'> | null {
  const locale = normalizeLanguageTag(value);
  return locale === 'pt' || locale === 'es' ? locale : null;
}

export function localeFromAcceptLanguage(header: string | null | undefined): Exclude<Locale, 'en'> | null {
  if (!header) return null;

  const candidates = header
    .split(',')
    .map((entry, index) => {
      const [tag, ...parameters] = entry.trim().split(';');
      let quality = 1;
      for (const parameter of parameters) {
        const match = /^q\s*=\s*(0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/i.exec(parameter.trim());
        if (match) quality = Number(match[1]);
      }
      return { tag: tag ?? '', quality, index };
    })
    .filter((entry) => entry.quality > 0)
    .sort((left, right) => right.quality - left.quality || left.index - right.index);

  return candidates[0] ? normalizeHeaderLanguageTag(candidates[0].tag) : null;
}

export const LOCALE_COOKIE_NAME = 'devhub_locale';

export function localeFromCookieHeader(header: string | null | undefined): Locale | null {
  if (!header) return null;
  for (const entry of header.split(';')) {
    const separator = entry.indexOf('=');
    if (separator < 0) continue;
    const name = entry.slice(0, separator).trim();
    if (name !== LOCALE_COOKIE_NAME) continue;
    try {
      return normalizeLanguageTag(decodeURIComponent(entry.slice(separator + 1).trim()));
    } catch {
      return null;
    }
  }
  return null;
}

export function localeFromRequest(request: Request, enabled = true): Locale {
  if (!enabled) return DEFAULT_LOCALE;
  return (
    localeFromCookieHeader(request.headers.get('cookie')) ??
    localeFromAcceptLanguage(request.headers.get('accept-language')) ??
    DEFAULT_LOCALE
  );
}

export function localeToHtmlLang(locale: Locale): string {
  return locale === 'pt' ? 'pt-BR' : locale;
}

export function formatLocalizedDate(
  value: string | Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(localeToHtmlLang(locale), { timeZone: 'UTC', ...options }).format(date);
}

export function formatTranslation(message: string, values: readonly unknown[] = []): string {
  return message.replace(/\{(\d+)\}/g, (_match, index: string) => String(values[Number(index)] ?? ''));
}

export function createTranslator<const Catalogs extends Record<Locale, Record<string, string>>>(catalogs: Catalogs) {
  type TranslationKey = keyof Catalogs['en'];
  return (locale: Locale, key: TranslationKey, values: readonly unknown[] = []): string =>
    formatTranslation(catalogs[locale][key as string] ?? catalogs.en[key as string] ?? String(key), values);
}
