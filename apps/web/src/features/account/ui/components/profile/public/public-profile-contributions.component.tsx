import { formatPublicDate } from '@/shared/utils/format-public-date.util.ts';
import { useI18n, type TranslationKey } from '@/features/account/i18n';
import { For, Show } from 'solid-js';
import ToggleButton from '@/shared/ui/components/actions/toggle-button.component.tsx';
import { contributionHref, contributionMeta, type ProfileContribution, type ProfileTab } from './profile-contributions.component.ts';
type Filter = { id: ProfileTab; labelKey: TranslationKey; count: number };

export default function PublicProfileContributions(props: {
  total: number;
  filters: Filter[];
  activeTab: ProfileTab | null;
  items: ProfileContribution[];
  onSelectTab: (tab: ProfileTab) => void;
}) {
  const { t, locale } = useI18n();
  return (
    <section aria-labelledby="profile-contributions-heading" class="min-w-0">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-eyebrow">{t('publicprofile.contributionsPublic')}</p>
          <h2 id="profile-contributions-heading" class="heading-section mt-2">
            {t('publicprofile.contentPublished')}
          </h2>
        </div>
        <p class="text-muted">
          {props.total} {props.total === 1 ? t('publicprofile.itemPublic') : t('publicprofile.itemsPublic')}
        </p>
      </div>
      <Show when={props.filters.length}>
        <div class="mt-5 flex gap-2 overflow-x-auto pb-1">
          <For each={props.filters}>
            {(filter) => (
              <ToggleButton
                type="button"
                onClick={() => props.onSelectTab(filter.id)}
                pressed={props.activeTab === filter.id}
                size="sm"
              >
                {t(filter.labelKey)} <span class="ml-1 opacity-80">{filter.count}</span>
              </ToggleButton>
            )}
          </For>
        </div>
      </Show>
      <Show
        when={props.items.length}
        fallback={
          <p class="text-muted mt-6 rounded-2xl border border-dashed border-line p-6">
            {t('publicprofile.noContributionPublicThisCategory')}
          </p>
        }
      >
        <div class="mt-5 space-y-3">
          <For each={props.items}>
            {(item) => {
              const meta = contributionMeta[item.type];
              const Icon = meta.icon;
              return (
                <a
                  href={contributionHref(item)}
                  class="group block rounded-2xl border border-line bg-surface-elevated p-5 transition duration-standard ease-standard hover:border-action-border hover:bg-surface-elevated"
                >
                  <div class="flex items-start gap-3">
                    <span class="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-action-subtle text-content-accent">
                      <Icon class="size-4" />
                    </span>
                    <div class="min-w-0 flex-1">
                      <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <p class="text-accent-label">{t(meta.labelKey)}</p>
                        <Show when={item.occurredAt}>
                          <time class="text-xs text-content-muted">{formatPublicDate(item.occurredAt!, locale())}</time>
                        </Show>
                      </div>
                      <h3 class="heading-callout mt-2 text-base transition duration-standard ease-standard group-hover:text-content-accent"
                       
                       
                       
                      >
                        {item.title}
                      </h3>
                      <Show when={item.contributionCount}>
                        <p class="text-caption mt-2">
                          {item.contributionCount} {t('publicprofile.contributions')}
                        </p>
                      </Show>
                    </div>
                  </div>
                </a>
              );
            }}
          </For>
        </div>
      </Show>
    </section>
  );
}
