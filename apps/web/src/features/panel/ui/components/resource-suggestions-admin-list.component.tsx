import { Check, Link, WandSparkles, X } from 'lucide-solid';
import { createSignal, onMount, For, Show } from 'solid-js';
import { createForm, reset, setValue } from '@modular-forms/solid';
import TagSelector from '@/shared/ui/components/forms/tag-selector.component.tsx';
import type { ResourceSuggestionDTO } from '@/features/resource/public';
import {
  approveResourceSuggestion,
  listPendingResourceSuggestions,
  rejectResourceSuggestion,
  loadResourceMetadata,
} from '@/features/resource/public';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/panel/i18n';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import StatusBadge from '@/shared/ui/components/feedback/status-badge.component.tsx';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import { zodForm } from '@/shared/ui/forms/zod-form';
import {
  createResourceSuggestionRejectSchema,
  createResourceSuggestionReviewSchema,
  type ResourceSuggestionRejectFormInput,
  type ResourceSuggestionReviewFormInput,
} from '@/features/panel/ui/schemas/forms.schema.ts';

function PendingResource(props: { item: ResourceSuggestionDTO; onDone: () => void }) {
  const { t, locale } = useI18n();
  const [busy, setBusy] = createSignal<'metadata' | 'approve' | 'reject' | null>(null);
  const [metadataMessage, setMetadataMessage] = createSignal('');
  const [rejectOpen, setRejectOpen] = createSignal(false);
  const [reviewForm, { Form: ReviewForm, Field: ReviewField }] = createForm<ResourceSuggestionReviewFormInput>({
    validate: zodForm(createResourceSuggestionReviewSchema(locale())),
  });
  const [rejectForm, { Form: RejectForm, Field: RejectField }] = createForm<ResourceSuggestionRejectFormInput>({
    validate: zodForm(createResourceSuggestionRejectSchema()),
  });

  const loadMetadata = async () => {
    if (busy()) return;
    setBusy('metadata');
    setMetadataMessage('');
    try {
      const metadata = await loadResourceMetadata(props.item.url);
      if (metadata.title) setValue(reviewForm, 'title', metadata.title);
      if (metadata.description) setValue(reviewForm, 'description', metadata.description);
      setMetadataMessage(t('resourcependingadminlist.metadataLoadedReviewBeforePublish'));
    } catch {
      setMetadataMessage(t('resourcependingadminlist.couldNotAccessMetadataAutomaticallyFillFieldsManually'));
    } finally {
      setBusy(null);
    }
  };

  const approve = async (values: ResourceSuggestionReviewFormInput) => {
    if (busy()) return;
    setBusy('approve');
    try {
      const approved = await approveResourceSuggestion(props.item.id, {
        title: values.title.trim(),
        description: values.description.trim(),
        tagSlugs: values.tags.slice(0, 5),
      });
      if (approved.kind === 'success') {
        reset(reviewForm);
        reset(rejectForm);
        props.onDone();
      }
    } finally {
      setBusy(null);
    }
  };

  const reject = async (values: ResourceSuggestionRejectFormInput) => {
    if (busy()) return;
    setBusy('reject');
    try {
      const note = values.decisionNote.trim();
      const rejected = await rejectResourceSuggestion(props.item.id, { decisionNote: note || undefined });
      if (rejected.kind === 'success') {
        reset(reviewForm);
        reset(rejectForm);
        setRejectOpen(false);
        props.onDone();
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <li class="grid gap-4 px-5 py-5 sm:px-6">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div class="grid min-w-0 gap-2">
          <StatusBadge status="warning" class="min-h-6 px-2 py-0.5 text-[11px]">
            {t('resourcependingadminlist.pending')}
          </StatusBadge>
          <a
            href={props.item.url}
            target="_blank"
            rel="noreferrer"
            class="flex items-center gap-2 break-all text-xs font-semibold text-content-accent"
          >
            <Link class="size-3.5 shrink-0" />
            {props.item.url}
          </a>
          <p class="text-caption">
            {t('resourcependingadminlist.submitted')}{' '}
            {String(props.item.submittedByAccountId ?? t('resourcependingadminlist.accountUnavailable'))}
          </p>
        </div>
        <button type="button" disabled={Boolean(busy())} onClick={() => void loadMetadata()} class="action action-secondary">
          <WandSparkles class="size-3.5" aria-hidden="true" />
          {busy() === 'metadata' ? t('common.refreshing') : t('resourcependingadminlist.preFillMetadata')}
        </button>
      </div>

      <ReviewForm onSubmit={approve} class="grid gap-4">
        <div class="grid gap-3 lg:grid-cols-2">
          <ReviewField name="title">
            {(field, fieldProps) => (
              <Field>
                <label for={`resource-suggestion-title-${props.item.id}`} class="field-label">
                  {t('resourcependingadminlist.title')}
                </label>
                <input
                  {...fieldProps}
                  id={`resource-suggestion-title-${props.item.id}`}
                  value={field.value ?? ''}
                  maxlength="40"
                  aria-invalid={Boolean(field.error)}
                 class="field-control"/>
                {field.error ? <p class="text-danger">{field.error}</p> : null}
              </Field>
            )}
          </ReviewField>
          <ReviewField name="tags" type="string[]">
            {(field) => (
              <TagSelector
                id={`resource-suggestion-tags-${props.item.id}`}
                value={field.value ?? []}
                onChange={(value) => setValue(reviewForm, 'tags', value)}
                max={5}
                label={t('resourcependingadminlist.tags')}
              />
            )}
          </ReviewField>
          <ReviewField name="description">
            {(field, fieldProps) => (
              <Field class="lg:col-span-2">
                <label for={`resource-suggestion-description-${props.item.id}`} class="field-label">
                  {t('resourcependingadminlist.description')}
                </label>
                <textarea
                  {...fieldProps}
                  id={`resource-suggestion-description-${props.item.id}`}
                  value={field.value ?? ''}
                  maxlength="160"
                  rows="3"
                  aria-invalid={Boolean(field.error)}
                 class="field-control resize-y"/>
                {field.error ? <p class="text-danger">{field.error}</p> : null}
              </Field>
            )}
          </ReviewField>
        </div>
        <Show when={metadataMessage()}>
          <p role="status" class="text-caption">
            {metadataMessage()}
          </p>
        </Show>
        <div class="flex justify-end gap-2">
          <button type="button" disabled={Boolean(busy())} onClick={() => setRejectOpen(true)} class="action action-danger-outline">
            <X class="size-3.5" aria-hidden="true" /> {t('codexproposals.reject')}
          </button>
          <button type="submit" disabled={Boolean(busy())} aria-busy={busy() === 'approve'} class="action action-primary">
            <Check class="size-3.5" aria-hidden="true" />
            {busy() === 'approve' ? t('common.publishing') : t('resourcependingadminlist.publishResource')}
          </button>
        </div>
      </ReviewForm>

      <Show when={rejectOpen()}>
        <RejectForm onSubmit={reject} class="grid gap-3 rounded-xl border border-danger-border bg-danger-bg p-4">
          <div class="grid gap-1">
            <p class="text-strong">{t('resourcependingadminlist.rejectSuggestion')}</p>
            <p class="text-muted-compact">{t('resourcependingadminlist.rejectSuggestionDescription')}</p>
          </div>
          <RejectField name="decisionNote">
            {(field, fieldProps) => (
              <Field>
                <label class="field-label">{t('resourcependingadminlist.decisionNote')}</label>
                <textarea
                  {...fieldProps}
                  rows={3}
                  value={field.value ?? ''}
                  placeholder={t('resourcependingadminlist.decisionNotePlaceholder')}
                 class="field-control resize-y"/>
              </Field>
            )}
          </RejectField>
          <div class="flex flex-wrap justify-end gap-2">
            <button
              type="button"
             
              disabled={Boolean(busy())}
              onClick={() => {
                setRejectOpen(false);
                reset(rejectForm);
              }} class="action action-secondary"
            >
              {t('resourcependingadminlist.cancel')}
            </button>
            <button type="submit" disabled={Boolean(busy())} aria-busy={busy() === 'reject'} class="action action-danger">
              <X class="size-4" aria-hidden="true" />
              {busy() === 'reject'
                ? t('resourcependingadminlist.rejecting')
                : t('resourcependingadminlist.confirmReject')}
            </button>
          </div>
        </RejectForm>
      </Show>
    </li>
  );
}

function ResourceSuggestionsAdminList() {
  const { t } = useI18n();
  const [loading, setLoading] = createSignal(true);
  const [items, setItems] = createSignal<ResourceSuggestionDTO[]>([]);
  const load = async () => {
    setLoading(true);
    const result = await listPendingResourceSuggestions();
    setItems(result.items);
    setLoading(false);
  };
  onMount(() => void load());
  return (
    <ListPanel>
      <header class="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-5 sm:px-6">
        <div class="grid gap-1">
          <h2 class="heading-callout text-sm">
            {t('resourcesuggestionsadminlist.pendingSuggestions')}
          </h2>
          <p class="text-muted">{t('resourcependingadminlist.reviewUrlCompleteDataPublishResource')}</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading()} class="action action-secondary">
          {loading() ? t('common.refreshing') : t('common.refresh')}
        </button>
      </header>
      <Show
        when={!loading()}
        fallback={<LoadingState>{t('resourcesuggestionsadminlist.loadingSuggestions')}</LoadingState>}
      >
        <ListPanelList>
          <For
            each={items()}
            fallback={
              <li class="px-6 py-12 text-center">
                <p class="text-strong">{t('resourcesuggestionsadminlist.noSuggestionPending')}</p>
              </li>
            }
          >
            {(item) => <PendingResource item={item} onDone={() => void load()} />}
          </For>
        </ListPanelList>
      </Show>
    </ListPanel>
  );
}

export default withLocale(ResourceSuggestionsAdminList);
