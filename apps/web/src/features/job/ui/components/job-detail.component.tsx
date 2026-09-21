import TagLink from '@/shared/ui/components/navigation/tag-link.component.tsx';
import { createStore } from 'solid-js/store';
import { onMount, Show } from 'solid-js';
import { ExternalLink } from 'lucide-solid';
import ShareButton from '@/shared/ui/components/actions/share-button.component.tsx';
import { ReportButton } from '@/features/report/public';
import { getJobQuery } from '@/features/job/actions/job.action.ts';
import type { Job } from '@/features/job/types/job.type.ts';
import { formatPublicDate } from '@/shared/utils/format-public-date.util.ts';
import { routes } from '@/shared/navigation/routes';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/job/i18n';
import { jobTypeLabel, workplaceLabel, compensationUnitLabel } from '../options/job-options';

function JobDetail(props: { id: string; initialJob?: Job | null; initialError?: boolean }) {
  const { t, locale } = useI18n();
  const [state, setState] = createStore({
    loading: props.initialJob === undefined && !props.initialError,
    failed: Boolean(props.initialError),
    job: props.initialJob ?? null,
  });

  onMount(() => {
    if (props.initialJob !== undefined || props.initialError) return;
    void getJobQuery(props.id)
      .then((result) => setState({ job: result.data?.data ?? null, failed: Boolean(result.error), loading: false }))
      .catch(() => setState({ failed: true, loading: false }));
  });

  return (
    <Show
      when={!state.loading}
      fallback={
        <section class="rounded-2xl border border-line bg-surface p-6 text-sm text-content-muted">
          {t('jobdetail.loadingOpportunity')}
        </section>
      }
    >
      <Show
        when={state.job}
        fallback={
          <section class="rounded-2xl border border-line bg-surface p-6 text-sm text-content-muted">
            {state.failed ? t('jobdetail.couldNotLoadOpportunity') : t('jobdetail.opportunityNotFound')}
          </section>
        }
      >
        {(jobAccessor) => {
          const job = () => jobAccessor();
          return (
            <article class="rounded-3xl border border-line bg-surface-elevated p-5 shadow-sm sm:p-8">
              <div class="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <div class="grid min-w-0 gap-6">
                  <div class="grid gap-3">
                    <div class="grid gap-1">
                      <p class="text-accent-label">{jobTypeLabel(job().employmentType, t)}</p>
                      <p class="text-caption">{job().status}</p>
                    </div>
                    <h1 class="heading-detail">
                      {job().title}
                    </h1>
                    <div class="flex flex-wrap gap-2" aria-label={t('jobdetail.actionsOpportunity')}>
                      <Show
                        when={job().status === 'published'}
                        fallback={
                          <span class="self-center text-xs text-content-muted">
                            {t('jobdetail.opportunityClosedOrExpired')}
                          </span>
                        }
                      >
                        <a
                          href={job().applicationUrl}
                          target="_blank"
                          rel="noreferrer"
                          class="grid size-10 place-items-center rounded-xl bg-action text-content-on-accent shadow-sm transition hover:bg-action-hover"
                          title={t('jobdetail.applyExternally')}
                          aria-label={t('jobdetail.applyExternally')}
                        >
                          <ExternalLink class="size-4" aria-hidden="true" />
                        </a>
                      </Show>
                      <ShareButton
                        title={job().title}
                        url={routes.job(job().id)}
                        label={t('jobdetail.shareOpportunity')}
                        copiedLabel={t('jobdetail.linkCopied')}
                      />
                      <ReportButton target="resource" id={job().id} locale={locale()} />
                    </div>
                    <div class="grid gap-2">
                      <p class="text-muted">{t('jobdetail.published')}</p>
                      <p class="text-strong">
                        {job().compensationCurrency} {job().compensationMin}
                        {job().compensationMax ? `–${job().compensationMax}` : ''} /{' '}
                        {job().compensationUnit
                          ? compensationUnitLabel(job().compensationUnit!, t)
                          : t('jobdetail.notInformed')}
                      </p>
                      <p class="text-muted">
                        {job().publicationType === 'organization'
                          ? t('jobdetail.organization')
                          : t('jobdetail.publicationIndividual')}{' '}
                        · {workplaceLabel(job().workplaceType, t)}
                        {job().location ? ` · ${job().location}` : ''} {t('jobdetail.expires')}{' '}
                        {formatPublicDate(job().expiresAt, locale())}
                      </p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      {job().tagSlugs.map((tag) => (
                        <TagLink slug={tag} />
                      ))}
                    </div>
                  </div>
                  <div class="whitespace-pre-wrap text-content">{job().description}</div>
                  <div class="grid gap-2 rounded-2xl border border-line bg-surface p-4 text-xs text-content-muted">
                    <p class="text-body">
                      {t('jobdetail.thisOpportunityWasPublishedAccountDevhubPublisherAssumeResponsibilityBy')}
                    </p>
                    <p class="text-body">
                      {t('jobdetail.neverPayApplyConfirmCounterpartyNotSharePasswordsTokensOr')}
                    </p>
                  </div>
                </div>
                <aside class="space-y-4 lg:sticky lg:top-6">
                  <section class="grid gap-3 rounded-2xl border border-action-border bg-action-subtle p-5">
                    <h2 class="heading-callout text-sm">
                      {t('jobdetail.interestThisOpportunity')}
                    </h2>
                    <Show when={job().status === 'published'}>
                      <a href={job().applicationUrl} target="_blank" rel="noreferrer" class="action action-primary">
                        {t('jobdetail.apply')}
                      </a>
                    </Show>
                    <p class="text-caption">{t('jobdetail.processHappensOutsideDevhub')}</p>
                  </section>
                  <section class="grid gap-4 rounded-2xl border border-line bg-surface p-5">
                    <h2 class="heading-tiny text-xs">
                      {t('jobdetail.summary')}
                    </h2>
                    <dl class="grid gap-3 text-sm">
                      <div class="grid gap-1">
                        <dt class="text-xs text-content-muted">{t('jobdetail.format')}</dt>
                        <dd class="font-semibold text-content">{workplaceLabel(job().workplaceType, t)}</dd>
                      </div>
                      <div class="grid gap-1">
                        <dt class="text-xs text-content-muted">{t('jobdetail.location')}</dt>
                        <dd class="font-semibold text-content">{job().location ?? t('jobOptions.remote')}</dd>
                      </div>
                      <div class="grid gap-1">
                        <dt class="text-xs text-content-muted">{t('jobdetail.expiresAlternative2')}</dt>
                        <dd class="font-semibold text-content">{formatPublicDate(job().expiresAt, locale())}</dd>
                      </div>
                    </dl>
                  </section>
                </aside>
              </div>
            </article>
          );
        }}
      </Show>
    </Show>
  );
}

export default withLocale(JobDetail);
