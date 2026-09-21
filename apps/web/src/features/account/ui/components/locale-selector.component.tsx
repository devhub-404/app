import { createMemo, createSignal, For } from 'solid-js';
import { useStore } from '@nanostores/solid';
import { Menu } from '@ark-ui/solid/menu';
import { ChevronDown } from 'lucide-solid';
import { $account } from '@/features/account/store/account.store';
import { updatePreferences } from '@/features/account/actions/account.action.ts';
import { applyLocale, clearLocaleOverride } from '@/shared/i18n/core/solid';
import type { Locale } from '@/shared/i18n/core';
import { useI18n } from '@/shared/i18n/app';

type LocaleChoice = Locale | 'auto';

export default function LocaleSelector(props: { locale: Locale; preference?: Locale | null }) {
  const { t } = useI18n(props.locale);
  const account = useStore($account);
  const [busy, setBusy] = createSignal(false);
  const selected = createMemo<LocaleChoice>(() => {
    const details = account().details;
    if (details) return details.preferences?.locale ?? 'auto';
    return props.preference ?? 'auto';
  });
  const choices = [
    { value: 'auto' as const, label: t('shell.languageBrowser') },
    { value: 'pt' as const, label: t('shell.languagePortuguese') },
    { value: 'en' as const, label: t('shell.languageEnglish') },
    { value: 'es' as const, label: t('shell.languageSpanish') },
  ];
  const selectedLabel = createMemo(
    () => choices.find((choice) => choice.value === selected())?.label ?? choices[0]!.label,
  );

  const change = async (choice: LocaleChoice) => {
    if (choice === selected() || busy()) return;
    setBusy(true);
    try {
      if (account().details) {
        const ok = await updatePreferences({ locale: choice === 'auto' ? null : choice });
        if (!ok) return;
      }

      if (choice === 'auto') clearLocaleOverride();
      else applyLocale(choice);
      window.location.reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Menu.Root positioning={{ placement: 'bottom-start', gutter: 8, sameWidth: true }}>
      <Menu.Trigger
        type="button"
        disabled={busy()}
        class="relative flex h-10 w-full items-center justify-center rounded-xl border border-line bg-surface px-10 text-center text-sm text-content outline-none transition duration-standard ease-standard hover:border-action-border focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
        aria-label={t('shell.language')}
      >
        <span class="truncate">{selectedLabel()}</span>
        <ChevronDown class="absolute right-4 size-4 text-content-muted" aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Positioner class="!z-[1100]">
        <Menu.Content class="mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-3xl border border-line bg-surface-overlay p-2 shadow-ui-overlay backdrop-blur">
          <For each={choices}>
            {(choice) => (
              <Menu.Item
                value={choice.value}
                onSelect={() => void change(choice.value)}
                class="flex cursor-pointer items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-content transition duration-standard ease-standard hover:bg-surface-subtle data-[highlighted]:bg-surface-subtle data-[state=checked]:bg-action data-[state=checked]:text-content-on-accent"
              >
                <span>{choice.label}</span>
                <span class={selected() === choice.value ? 'text-current' : 'text-transparent'} aria-hidden="true">
                  ✓
                </span>
              </Menu.Item>
            )}
          </For>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
}
