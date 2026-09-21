import type { Locale } from '@/shared/i18n/core';

type LocalizedEntry = { data: { locale: Locale; slug: string } };

export function selectLocalizedEntries<Entry extends LocalizedEntry>(
  entries: readonly Entry[],
  locale: Locale,
): Entry[] {
  const entriesBySlug = new Map<string, Entry[]>();

  for (const entry of entries) {
    const localized = entriesBySlug.get(entry.data.slug) ?? [];
    localized.push(entry);
    entriesBySlug.set(entry.data.slug, localized);
  }

  return [...entriesBySlug.values()]
    .map(
      (localized) =>
        localized.find((entry) => entry.data.locale === locale) ??
        localized.find((entry) => entry.data.locale === 'en'),
    )
    .filter((entry): entry is Entry => Boolean(entry));
}

export function selectLocalizedEntry<Entry extends LocalizedEntry>(
  entries: readonly Entry[],
  slug: string,
  locale: Locale,
): Entry | undefined {
  return selectLocalizedEntries(entries, locale).find((entry) => entry.data.slug === slug);
}
