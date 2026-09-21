import { formatLocalizedDate, type Locale } from '@/shared/i18n/core';

/**
 * Formats public calendar dates deterministically across Astro SSR and hydration.
 * UTC is intentional: server and browser must produce the same text for one ISO value.
 */
export function formatPublicDate(value: string | Date, locale: Locale): string {
  return formatLocalizedDate(value, locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
