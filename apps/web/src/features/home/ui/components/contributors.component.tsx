import { createStore } from 'solid-js/store';
import { For, onMount, Show } from 'solid-js';
import { loadGithubContributors } from '@/features/home/actions/load-github-contributors.action.ts';
import { useI18n } from '@/features/home/i18n';
import { withLocale } from '@/shared/i18n/core/solid';

type Props = {
  apiUrl: string;
  sponsorUrl: string;
};

function Contributors(props: Props) {
  const { t } = useI18n();
  const [state, setState] = createStore({
    loading: true,
    failed: false,
    contributors: [] as Awaited<ReturnType<typeof loadGithubContributors>>['data'],
  });

  onMount(async () => {
    const result = await loadGithubContributors(props.apiUrl);
    setState({ loading: false, failed: !result.ok, contributors: result.data });
  });

  return (
    <section id="contribuidores" class="relative z-10 px-6 pb-20">
      <div class="mx-auto w-full max-w-6xl">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="text-eyebrow">{t('home.contributors')}</p>
            <h2 class="heading-large-section mt-2">
              {t('home.contributorsTitle')}
            </h2>
            <p class="text-muted mt-2 max-w-xl">
              {t('home.contributorsDescription')}
            </p>
          </div>
          <a href={props.sponsorUrl} target="_blank" rel="noreferrer" class="action action-secondary action-compact">
            {t('home.sponsor')}
          </a>
        </div>

        <Show
          when={!state.loading}
          fallback={
            <div class="mt-6 rounded-2xl border border-line bg-surface p-5 text-sm text-content-muted" role="status">
              {t('home.contributors')}
            </div>
          }
        >
          <Show
            when={state.contributors.length > 0}
            fallback={
              <div class="mt-6 rounded-2xl border border-line bg-surface p-5 text-sm text-content-muted">
                {state.failed ? t('home.contributorsError') : t('home.noContributors')}
              </div>
            }
          >
            <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <For each={state.contributors}>
                {(contributor) => (
                  <a
                    href={contributor.html_url}
                    target="_blank"
                    rel="noreferrer"
                    class="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm transition duration-standard ease-standard hover:border-action-border"
                  >
                    <img
                      src={contributor.avatar_url}
                      alt={`${t('home.contributorAvatar')} ${contributor.login}`}
                      class="h-12 w-12 rounded-full border border-line object-cover"
                      loading="lazy"
                    />
                    <div>
                      <p class="text-strong">{contributor.login}</p>
                      <p class="text-caption mt-1">
                        {contributor.contributions} {t('home.contributions')}
                      </p>
                    </div>
                  </a>
                )}
              </For>
            </div>
          </Show>
        </Show>
      </div>
    </section>
  );
}

export default withLocale(Contributors);
