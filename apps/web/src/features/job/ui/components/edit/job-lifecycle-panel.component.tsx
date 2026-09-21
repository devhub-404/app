import { Show, createSignal } from 'solid-js';
import type { Job } from '@/features/job/types/job.type.ts';
import { formatLocalizedDate } from '@/shared/i18n/core';
import { useI18n } from '@/features/job/i18n';
import LifecyclePanel from '@/shared/ui/editor/components/lifecycle-panel.component.tsx';
import StatusBadge from '@/shared/ui/components/feedback/status-badge.component.tsx';
import DestructiveConfirmation from '@/shared/ui/components/feedback/destructive-confirmation.component.tsx';
import { Archive, RefreshCw, Trash } from 'lucide-solid';

export default function JobLifecyclePanel(props: {
  job: Job;
  busy: boolean;
  canClose: boolean;
  canRenew: boolean;
  canWithdraw: boolean;
  onAction: (action: 'close' | 'renew' | 'withdraw') => void;
}) {
  const { t, locale } = useI18n();
  const [confirmWithdraw, setConfirmWithdraw] = createSignal(false);
  return (
    <LifecyclePanel
      headingId="job-lifecycle-heading"
      eyebrow={t('editjob.availability')}
      heading={
        <>
          {t('editjob.status')} {props.job.status}
        </>
      }
      badge={
        <Show when={props.job.hiddenAt}>
          <StatusBadge status="danger">{t('editjob.hiddenByModeration')}</StatusBadge>
        </Show>
      }
      description={
        <>
          {t('editjob.validityCurrentEnds')} {formatLocalizedDate(props.job.expiresAt, locale())}.
        </>
      }
      actions={
        <>
          <Show when={props.canClose}>
            <button type="button" disabled={props.busy} onClick={() => props.onAction('close')} class="action action-secondary">
              <Archive class="size-4" />
              {props.busy ? t('editjob.applying') : t('editjob.closeOpportunity')}
            </button>
          </Show>
          <Show when={props.canRenew}>
            <button type="button" disabled={props.busy} onClick={() => props.onAction('renew')} class="action action-primary">
              <RefreshCw class="size-4" />
              {props.busy ? t('editjob.applying') : t('editjob.renewAvailability')}
            </button>
          </Show>
          <Show when={props.canWithdraw}>
            <button
             
              type="button"
              disabled={props.busy}
              onClick={() => setConfirmWithdraw(true)} class="action action-danger-outline"
            >
              <Trash class="size-4" />
              {t('editjob.remove')}
            </button>
          </Show>
        </>
      }
      confirmation={
        <Show when={confirmWithdraw()}>
          <DestructiveConfirmation
            accessibleLabel={t('editjob.confirmRemovedJob')}
            title={t('editjob.removeThisOpportunity')}
            description={t('editjob.opportunityMakesBeServedPubliclyCloseWantPreserveHistoryPublication')}
            confirmLabel={props.busy ? t('editjob.withdrawing') : t('editjob.confirmWithdrawal')}
            cancelLabel={t('editjob.cancel')}
            busy={props.busy}
            onConfirm={() => props.onAction('withdraw')}
            onCancel={() => setConfirmWithdraw(false)}
          />
        </Show>
      }
    />
  );
}
