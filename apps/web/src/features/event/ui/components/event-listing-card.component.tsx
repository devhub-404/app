import { CalendarDays, ExternalLink } from 'lucide-solid';
import type { Event } from '@/features/event/types/event.type.ts';
import { useI18n } from '@/features/event/i18n';
import { formatLocalizedDate } from '@/shared/i18n/core';
import { routes } from '@/shared/navigation/routes';

type Props = { event: Event; view: 'grid' | 'list' };

function EventListingCard(props: Props) {
  const { t, locale } = useI18n();
  const formatDate = (value: string) =>
    formatLocalizedDate(value, locale(), { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <article
      class={`flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface-elevated p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-action-border hover:shadow-md ${props.view === 'list' ? 'md:flex-row md:gap-6' : ''}`}
    >
      <div class="flex min-w-0 flex-1 flex-col">
        <div class="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[.14em] text-content-muted">
          <span class="inline-flex items-center gap-2">
            <CalendarDays class="size-4 text-content-accent" aria-hidden="true" />
            {props.event.temporalState === 'ongoing' ? t('events.happeningNow') : t('events.nextEvent')}
          </span>
          <span>
            {props.event.format === 'online'
              ? t('events.online')
              : props.event.format === 'hybrid'
                ? t('events.hybrid')
                : t('events.onsite')}
          </span>
        </div>
        <h2 class="heading-card mt-4 text-lg">
          {props.event.title}
        </h2>
        <p class="text-muted-body mt-2 line-clamp-3">
          {props.event.description}
        </p>
        <div class="mt-4 space-y-1 text-sm text-content">
          <p class="text-body">{formatDate(props.event.startsAt)}</p>
          <p class="text-muted">
            {t('events.upTo')} {formatDate(props.event.endsAt)}
          </p>
          {props.event.location && <p class="text-muted">{props.event.location}</p>}
        </div>
        <div class="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
          {props.event.url && (
            <a
              href={props.event.url}
              target="_blank"
              rel="noreferrer"
              class="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-content hover:border-action-border hover:text-content-accent"
            >
              {t('events.siteOfficial')} <ExternalLink class="size-3.5" aria-hidden="true" />
            </a>
          )}
          {props.event.slug && (
            <a href={routes.event(props.event.slug)} class="text-xs font-semibold text-content-accent hover:underline">
              {t('events.viewDetails')}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default EventListingCard;
