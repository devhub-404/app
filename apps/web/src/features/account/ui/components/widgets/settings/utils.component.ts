import { localeToHtmlLang, type Locale } from '@/shared/i18n/core';
import type { TranslationKey } from '@/features/account/i18n';

export type AuthIdentityProvider = 'local' | 'google' | 'github' | 'passkey';
type Translator = (key: TranslationKey) => string;

export function providerLabel(provider: AuthIdentityProvider, t: Translator) {
  if (provider === 'google') return 'Google';
  if (provider === 'github') return 'GitHub';
  if (provider === 'passkey') return 'Passkey';
  return t('constants.password');
}

export function safeDate(value: string | null | undefined, locale: Locale): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(localeToHtmlLang(locale), { timeZone: 'UTC' });
}
