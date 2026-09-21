import { Briefcase } from 'lucide-solid';
import { For } from 'solid-js';
import type { Job } from '@/features/job/types/job.type.ts';
import { routes } from '@/shared/navigation/routes';
import { formatPublicDate } from '@/shared/utils/format-public-date.util.ts';
import TagLink from '@/shared/ui/components/navigation/tag-link.component.tsx';
import { compensationUnitLabel, workplaceLabel } from '../options/job-options';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/job/i18n';

function JobCard(props: { job: Job }) {
  const { t, locale } = useI18n();
  const job = () => props.job;
  const compensation = () => {
    const unit = job().compensationUnit;
    return `${job().compensationCurrency ?? ''} ${job().compensationMin ?? ''}${job().compensationMax ? `–${job().compensationMax}` : ''}${unit ? ` · ${compensationUnitLabel(unit, t)}` : ''}`;
  };

  return (
    <article class="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface-elevated shadow-sm transition duration-standard ease-standard hover:-translate-y-0.5 hover:border-action-border hover:shadow-md">
      <div class="flex min-w-0 flex-1 flex-col p-4">
        <div class="flex min-h-5 flex-wrap items-start justify-between gap-3">
          <span class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-content-muted">
            <Briefcase class="size-3.5 text-content-accent" aria-hidden="true" />
            {t('editjob.opportunity')}
          </span>
          <span class="shrink-0 text-sm font-semibold text-content-accent">{compensation()}</span>
        </div>
        <h2 class="heading-card mt-2 line-clamp-2 text-lg">
          <a href={routes.job(job().id)} class="transition duration-standard ease-standard hover:text-content-accent">
            {job().title}
          </a>
        </h2>
        <p class="text-muted-compact mt-1 line-clamp-3">
          {job().publicationType === 'organization'
            ? t('jobdetail.organization')
            : t('jobdetail.publicationIndividual')}{' '}
          · {workplaceLabel(job().workplaceType, t)}
          {job().location ? ` · ${job().location}` : ''}
        </p>
        <div class="mt-2 flex content-start flex-wrap gap-2">
          <For each={job().tagSlugs}>{(tag) => <TagLink slug={tag} />}</For>
        </div>
        <div class="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3 text-xs text-content-muted">
          <span>
            {t('jobdetail.expiresAlternative2')} {formatPublicDate(job().expiresAt, locale())}
          </span>
          <a href={routes.job(job().id)} class="action action-secondary">
            {t('jobs.viewOpportunity')}
          </a>
        </div>
      </div>
    </article>
  );
}

export default withLocale(JobCard);
