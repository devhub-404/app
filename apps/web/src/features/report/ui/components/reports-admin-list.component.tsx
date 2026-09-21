import ToggleButton from '@/shared/ui/components/actions/toggle-button.component.tsx';
import { CircleCheck, ListFilter, Flag, X } from 'lucide-solid';
import { For, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Dialog } from '@ark-ui/solid/dialog';
import { createForm, reset } from '@modular-forms/solid';
import { listReports, reviewReport } from '@/features/report/actions/report.action.ts';
import type { ReportDecision, ReportItem, ReportStatus } from '@/features/report/types/report.type.ts';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';
import StatusBadge from '@/shared/ui/components/feedback/status-badge.component.tsx';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/report/i18n';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { createReportReviewSchema, type ReportReviewFormInput } from '@/features/report/ui/schemas/forms.schema.ts';

const filters = ['all', 'pending', 'resolved', 'dismissed'] as const;
type Filter = (typeof filters)[number];
const statusTone = (status: ReportStatus): 'warning' | 'success' | 'danger' | 'neutral' =>
  status === 'pending' ? 'warning' : status === 'resolved' ? 'success' : status === 'dismissed' ? 'danger' : 'neutral';

function ReportsAdminList() {
  const { t, locale } = useI18n();
  const [state, setState] = createStore({
    items: [] as ReportItem[],
    loading: true,
    filter: 'pending' as Filter,
    reviewing: null as ReportItem | null,
    decision: 'resolved' as ReportDecision,
    busy: false,
  });
  const [_form, { Form, Field: FormField }] = createForm<ReportReviewFormInput>({
    initialValues: { note: '' },
    validate: zodForm(createReportReviewSchema(locale())),
    validateOn: 'submit',
    revalidateOn: 'input',
  });
  const load = async () => {
    setState('loading', true);
    const status = state.filter === 'all' ? undefined : (state.filter as ReportStatus);
    const result = await listReports(status);
    setState('items', result.items);
    setState('loading', false);
  };

  onMount(() => void load());

  const changeFilter = (next: Filter) => {
    setState('filter', next);
    queueMicrotask(() => void load());
  };

  const openReview = (item: ReportItem, nextDecision: ReportDecision) => {
    setState('reviewing', item);
    setState('decision', nextDecision);
  };

  const closeReview = () => {
    if (state.busy) return;
    setState('reviewing', null);
    reset(_form);
  };

  const submitReview = async (values: ReportReviewFormInput) => {
    const item = state.reviewing;
    if (!item || state.busy) return;
    setState('busy', true);
    const normalizedNote = values.note?.trim() ?? '';
    const ok = await reviewReport(item, { decision: state.decision, note: normalizedNote || undefined });
    setState('busy', false);
    if (ok) {
      closeReview();
      await load();
    }
  };

  return (
    <ListPanel>
      <header class="grid gap-4 border-b border-line px-5 py-5 sm:px-6">
        <div class="grid gap-1">
          <h2 class="heading-callout flex items-center gap-2 text-sm">
            <Flag class="size-4 text-content-accent" aria-hidden="true" />
            {t('report.adminTitle')}
          </h2>
          <p class="text-muted">{t('report.adminDescription')}</p>
        </div>

        <nav class="flex flex-wrap gap-2" aria-label={t('report.filterLabel')}>
          <For each={filters}>
            {(value) => (
              <ToggleButton
                type="button"
                pressed={state.filter === value}
                size="sm"
                onClick={() => changeFilter(value)}
              >
                <ListFilter class="size-4" aria-hidden="true" />
                {t(`report.filter.${value}`)}
              </ToggleButton>
            )}
          </For>
        </nav>
      </header>

      <Show when={!state.loading} fallback={<LoadingState>{t('report.loading')}</LoadingState>}>
        <ListPanelList>
          <For each={state.items} fallback={<li class="px-6 py-10 text-sm text-content-muted">{t('report.empty')}</li>}>
            {(item) => (
              <li class="grid gap-4 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:px-6">
                <div class="grid min-w-0 gap-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <StatusBadge class="min-h-6 px-2 py-0.5 text-[11px] uppercase tracking-wide">
                      {t(`report.kind.${item.kind}`)}
                    </StatusBadge>
                    <StatusBadge status={statusTone(item.status)} class="min-h-6 px-2 py-0.5 text-[11px]">
                      {t(`report.status.${item.status}`)}
                    </StatusBadge>
                  </div>
                  <p class="text-strong">{item.reason ?? t('report.reasonUnavailable')}</p>
                  <Show when={item.description}>
                    <p class="text-muted-body">{item.description}</p>
                  </Show>
                  <dl class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-content-subtle">
                    <Show when={item.targetLabel ?? item.targetId}>
                      <div>
                        <dt class="inline font-semibold">{t('report.target')}: </dt>
                        <dd class="inline">{item.targetLabel ?? item.targetId}</dd>
                      </div>
                    </Show>
                    <Show when={item.reporterLabel}>
                      <div>
                        <dt class="inline font-semibold">{t('report.reporter')}: </dt>
                        <dd class="inline">{item.reporterLabel}</dd>
                      </div>
                    </Show>
                    <Show when={item.createdAt}>
                      <div>
                        <dt class="inline font-semibold">{t('report.createdAt')}: </dt>
                        <dd class="inline">{item.createdAt}</dd>
                      </div>
                    </Show>
                  </dl>
                  <Show when={item.reviewNote}>
                    <p class="text-caption rounded-xl bg-surface-subtle px-3 py-2">
                      {t('report.reviewNote')}: {item.reviewNote}
                    </p>
                  </Show>
                </div>

                <Show when={item.status === 'pending'}>
                  <div class="flex flex-wrap gap-2 sm:justify-end">
                    <button type="button" onClick={() => openReview(item, 'dismissed')} class="action action-secondary">
                      <X class="size-3.5" aria-hidden="true" />
                      {t('report.dismiss')}
                    </button>
                    <button type="button" onClick={() => openReview(item, 'resolved')} class="action action-primary">
                      <CircleCheck class="size-3.5" aria-hidden="true" />
                      {t('report.resolve')}
                    </button>
                  </div>
                </Show>
              </li>
            )}
          </For>
        </ListPanelList>
      </Show>

      <Show when={state.reviewing}>
        {(selected) => (
          <Dialog.Root open={true} onOpenChange={(details) => !details.open && closeReview()}>
            <Dialog.Backdrop class="fixed inset-0 z-50 bg-scrim" />
            <Dialog.Positioner class="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4 sm:p-6">
              <Dialog.Content class="grid w-full max-w-lg gap-5 rounded-3xl border border-line bg-surface-elevated p-6 shadow-ui-overlay">
                <header class="grid gap-1">
                  <Dialog.Title id="review-report-title" class="text-lg font-semibold text-content">
                    {state.decision === 'resolved' ? t('report.resolveTitle') : t('report.dismissTitle')}
                  </Dialog.Title>
                  <Dialog.Description class="text-sm text-content-muted">
                    {selected().reason ?? t('report.reasonUnavailable')}
                  </Dialog.Description>
                </header>

                <Form class="grid gap-4" onSubmit={submitReview}>
                  <Field>
                    <label for="report-review-note" class="field-label">{t('report.note')}</label>
                    <FormField name="note">
                      {(_, fieldProps) => (
                        <textarea
                          {...fieldProps}
                          id="report-review-note"
                          rows={4}
                          maxlength={2000}
                          placeholder={t('report.notePlaceholder')}
                         class="field-control resize-y"/>
                      )}
                    </FormField>
                  </Field>
                  <footer class="flex flex-wrap justify-end gap-2">
                    <Dialog.CloseTrigger
                      asChild={(triggerProps) => (
                        <button {...triggerProps} type="button" disabled={state.busy} class="action action-secondary">
                          <X class="size-4" aria-hidden="true" />
                          {t('report.cancel')}
                        </button>
                      )}
                    />
                    <button
                      type="submit"
                     
                      disabled={state.busy} class="action action-state.decision === 'resolved' ? 'primary' : 'danger'"
                    >
                      {state.decision === 'resolved' ? (
                        <CircleCheck class="size-4" aria-hidden="true" />
                      ) : (
                        <X class="size-4" aria-hidden="true" />
                      )}
                      {state.busy
                        ? t('report.reviewing')
                        : state.decision === 'resolved'
                          ? t('report.resolve')
                          : t('report.dismiss')}
                    </button>
                  </footer>
                </Form>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Root>
        )}
      </Show>
    </ListPanel>
  );
}

export default withLocale(ReportsAdminList);
