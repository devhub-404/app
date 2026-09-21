import { formatPublicDate } from '@/shared/utils/format-public-date.util.ts';
import { useI18n } from '@/features/account/i18n';
import { contributionHref, contributionMeta, type ProfileContribution } from './profile-contributions.component.ts';
import { For, Show } from 'solid-js';
export default function PublicProfileActivity(props: { items: ProfileContribution[] }) {
  const { t, locale } = useI18n();
  return (
    <aside class="space-y-4 lg:sticky lg:top-24" aria-label={t('publicprofile.activityPublicRecent')}>
      <section class="rounded-2xl border border-line bg-surface-elevated p-5">
        <p class="text-eyebrow">{t('publicprofile.activity')}</p>
        <h2 class="heading-card mt-2 text-lg">
          {t('publicprofile.interactionsPublic')}
        </h2>
        <p class="text-muted-body mt-2">
          {t('publicprofile.questionsAnswersContributionsMoreRecent')}
        </p>
        <Show
          when={props.items.length}
          fallback={
            <p class="text-muted mt-5">
              {t('publicprofile.noInteractionPublicRecent')}
            </p>
          }
        >
          <div class="mt-5 space-y-4">
            <For each={props.items}>
              {(item) => (
                <a
                  href={contributionHref(item)}
                  class="block border-l-2 border-line pl-3 transition duration-standard ease-standard hover:border-action-border"
                >
                  <p class="text-accent">{t(contributionMeta[item.type].labelKey)}</p>
                  <p class="text-body mt-1 line-clamp-2">
                    {item.title}
                  </p>
                  <Show when={item.occurredAt}>
                    <p class="text-caption mt-1">
                      {formatPublicDate(item.occurredAt!, locale())}
                    </p>
                  </Show>
                </a>
              )}
            </For>
          </div>
        </Show>
      </section>
    </aside>
  );
}
