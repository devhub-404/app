import { messages, type Lang, type MessageCode } from '@/shared/i18n/core/messages';

function isLang(value: unknown): value is Lang {
  return value === 'pt' || value === 'en' || value === 'es';
}

function activeLanguage(explicit?: Lang): Lang {
  if (explicit) return explicit;
  if (typeof document !== 'undefined') {
    const locale = document.documentElement.dataset['locale'];
    if (isLang(locale)) return locale;
  }
  if (typeof navigator !== 'undefined') {
    for (const value of navigator.languages ?? [navigator.language]) {
      const primary = value.toLowerCase().split('-')[0];
      if (isLang(primary)) return primary;
    }
  }
  return 'en';
}

export function resolveMessage(code?: MessageCode | string | null, locale?: Lang) {
  const lang = activeLanguage(locale);
  const normalized = typeof code === 'string' ? code.trim() : '';
  if (!normalized) return '';
  return messages[lang]?.[normalized as MessageCode] ?? messages.en[normalized as MessageCode] ?? '';
}
