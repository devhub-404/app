import { Activity, CircleCheck, CircleX, RefreshCw } from 'lucide-solid';
import { createResource, Show } from 'solid-js';
import { getPlatformStatus } from '@/features/platform/public';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/panel/i18n';

function PlatformStatus() {
  const { t } = useI18n();
  const [status, { refetch }] = createResource(getPlatformStatus);
  const ready = () => status()?.readiness?.ready ?? false;
  return (
    <div class="grid gap-4 lg:grid-cols-2">
      <article class="grid gap-4 rounded-3xl border border-line bg-surface-elevated p-5 sm:p-6">
        <header class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <Activity class="size-5 text-content-accent" />
            <h2 class="heading-callout">
              {t('platformstatus.health')}
            </h2>
          </div>
          <button
            type="button"
           
            aria-label={t('platformstatus.refresh')}
            title={t('platformstatus.refresh')}
            onClick={() => void refetch()} class="action action-secondary"
          >
            <RefreshCw class="size-4" />
          </button>
        </header>
        <Show
          when={status()?.health}
          fallback={
            <p class="text-muted">
              {status.loading ? t('platformstatus.loading') : t('platformstatus.unavailable')}
            </p>
          }
        >
          {(health) => (
            <div class="grid gap-1">
              <p class="text-strong">{health().status}</p>
              <p class="text-subtle">{health().timestamp}</p>
            </div>
          )}
        </Show>
      </article>
      <article class="grid gap-4 rounded-3xl border border-line bg-surface-elevated p-5 sm:p-6">
        <header class="flex items-center gap-2">
          {ready() ? <CircleCheck class="size-5 text-success" /> : <CircleX class="size-5 text-danger" />}
          <h2 class="heading-callout">
            {t('platformstatus.readiness')}
          </h2>
        </header>
        <Show
          when={status()?.readiness}
          fallback={
            <p class="text-muted">
              {status.loading ? t('platformstatus.loading') : t('platformstatus.unavailable')}
            </p>
          }
        >
          {(readiness) => (
            <div class="grid gap-1">
              <p class="text-strong">{readiness().status}</p>
              <p class="text-subtle">{readiness().timestamp}</p>
            </div>
          )}
        </Show>
      </article>
    </div>
  );
}
export default withLocale(PlatformStatus);
