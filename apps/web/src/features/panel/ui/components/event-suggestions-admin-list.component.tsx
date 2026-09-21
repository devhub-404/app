import { Check, ExternalLink, X } from 'lucide-solid';
import { createSignal, For, onMount, Show } from 'solid-js';
import { createForm, reset, setValue } from '@modular-forms/solid';
import {
  acceptEventSuggestion,
  listPendingEventSuggestionsQuery,
  rejectEventSuggestion,
  type EventSuggestionView,
} from '@/features/event/public';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/panel/i18n';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';
import Select from '@/shared/ui/components/forms/select.component.tsx';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import { zodForm } from '@/shared/ui/forms/zod-form';
import {
  createEventSuggestionRejectSchema,
  createEventSuggestionReviewSchema,
  type EventSuggestionRejectFormInput,
  type EventSuggestionReviewFormInput,
} from '@/features/panel/ui/schemas/forms.schema.ts';

function EventSuggestionRow(props: { item: EventSuggestionView; onDone: () => void }) {
  const { t, locale } = useI18n();
  const [busy, setBusy] = createSignal<'accept' | 'reject' | null>(null);
  const [reviewForm, { Form: ReviewForm, Field: ReviewField }] = createForm<EventSuggestionReviewFormInput>({
    initialValues: { format: 'online' },
    validate: zodForm(createEventSuggestionReviewSchema(locale())),
  });
  const [rejectForm, { Form: RejectForm, Field: RejectField }] = createForm<EventSuggestionRejectFormInput>({
    validate: zodForm(createEventSuggestionRejectSchema(locale())),
  });

  const accept = async (values: EventSuggestionReviewFormInput) => {
    if (busy()) return;
    setBusy('accept');
    try {
      const ok = await acceptEventSuggestion(props.item.id, {
        title: values.title.trim(),
        description: values.description.trim(),
        url: props.item.url,
        startsAt: new Date(values.startsAt).toISOString(),
        endsAt: new Date(values.endsAt).toISOString(),
        format: values.format,
      });
      if (ok.kind === 'success') {
        reset(reviewForm);
        reset(rejectForm);
        props.onDone();
      }
    } finally {
      setBusy(null);
    }
  };

  const reject = async (values: EventSuggestionRejectFormInput) => {
    if (busy()) return;
    setBusy('reject');
    try {
      const ok = await rejectEventSuggestion(props.item.id, values.reason.trim());
      if (ok.kind === 'success') {
        reset(reviewForm);
        reset(rejectForm);
        props.onDone();
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <li class="grid gap-4 px-5 py-5 sm:px-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <a
          class="inline-flex min-w-0 items-center gap-2 break-all text-sm font-semibold text-content-accent hover:underline"
          href={props.item.url}
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink class="size-4 shrink-0" aria-hidden="true" /> {props.item.url}
        </a>
        <span class="text-xs text-content-subtle">{props.item.createdAt}</span>
      </div>

      <ReviewForm onSubmit={accept} class="grid gap-3 lg:grid-cols-2">
        <ReviewField name="title">
          {(field, fieldProps) => (
            <Field>
              <label for={`event-suggestion-title-${props.item.id}`} class="field-label">
                {t('eventsuggestions.eventTitle')}
              </label>
              <input
                {...fieldProps}
                id={`event-suggestion-title-${props.item.id}`}
                value={field.value ?? ''}
                aria-invalid={Boolean(field.error)}
               class="field-control"/>
              {field.error ? <p class="text-danger">{field.error}</p> : null}
            </Field>
          )}
        </ReviewField>

        <ReviewField name="format">
          {(field) => (
            <Field>
              <label for={`event-suggestion-format-${props.item.id}`} class="field-label">{t('eventsuggestions.format')}</label>
              <Select<'online' | 'in_person' | 'hybrid'>
                id={`event-suggestion-format-${props.item.id}`}
                value={field.value ?? 'online'}
                ariaLabel={t('eventsuggestions.format')}
                options={[
                  { value: 'online', label: t('eventformat.online') },
                  { value: 'in_person', label: t('eventformat.inPerson') },
                  { value: 'hybrid', label: t('eventformat.hybrid') },
                ]}
                onChange={(value) => setValue(reviewForm, 'format', value)}
              />
              {field.error ? <p class="text-danger">{field.error}</p> : null}
            </Field>
          )}
        </ReviewField>

        <ReviewField name="description">
          {(field, fieldProps) => (
            <Field class="lg:col-span-2">
              <label for={`event-suggestion-description-${props.item.id}`} class="field-label">
                {t('eventsuggestions.eventDescription')}
              </label>
              <textarea
                {...fieldProps}
                id={`event-suggestion-description-${props.item.id}`}
                rows={3}
                value={field.value ?? ''}
                aria-invalid={Boolean(field.error)}
               class="field-control resize-y"/>
              {field.error ? <p class="text-danger">{field.error}</p> : null}
            </Field>
          )}
        </ReviewField>

        <ReviewField name="startsAt">
          {(field, fieldProps) => (
            <Field>
              <label for={`event-suggestion-starts-${props.item.id}`} class="field-label">{t('eventsuggestions.startsAt')}</label>
              <input
                {...fieldProps}
                id={`event-suggestion-starts-${props.item.id}`}
                type="datetime-local"
                value={field.value ?? ''}
                aria-invalid={Boolean(field.error)}
               class="field-control"/>
              {field.error ? <p class="text-danger">{field.error}</p> : null}
            </Field>
          )}
        </ReviewField>

        <ReviewField name="endsAt">
          {(field, fieldProps) => (
            <Field>
              <label for={`event-suggestion-ends-${props.item.id}`} class="field-label">{t('eventsuggestions.endsAt')}</label>
              <input
                {...fieldProps}
                id={`event-suggestion-ends-${props.item.id}`}
                type="datetime-local"
                value={field.value ?? ''}
                aria-invalid={Boolean(field.error)}
               class="field-control"/>
              {field.error ? <p class="text-danger">{field.error}</p> : null}
            </Field>
          )}
        </ReviewField>

        <div class="flex justify-end lg:col-span-2">
          <button type="submit" disabled={Boolean(busy())} aria-busy={busy() === 'accept'} class="action action-secondary">
            <Check class="size-3.5" aria-hidden="true" />
            {t('eventsuggestions.accept')}
          </button>
        </div>
      </ReviewForm>

      <RejectForm onSubmit={reject} class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <RejectField name="reason">
          {(field, fieldProps) => (
            <Field>
              <label for={`event-suggestion-reason-${props.item.id}`} class="field-label">
                {t('eventsuggestions.rejectReason')}
              </label>
              <input
                {...fieldProps}
                id={`event-suggestion-reason-${props.item.id}`}
                value={field.value ?? ''}
                aria-invalid={Boolean(field.error)}
               class="field-control"/>
              {field.error ? <p class="text-danger">{field.error}</p> : null}
            </Field>
          )}
        </RejectField>
        <button type="submit" disabled={Boolean(busy())} aria-busy={busy() === 'reject'} class="action action-secondary">
          <X class="size-3.5" aria-hidden="true" />
          {t('eventsuggestions.reject')}
        </button>
      </RejectForm>
    </li>
  );
}

function EventSuggestionsAdminList() {
  const { t } = useI18n();
  const [items, setItems] = createSignal<EventSuggestionView[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(false);

  const load = async () => {
    setLoading(true);
    const result = await listPendingEventSuggestionsQuery();
    setItems(result.items);
    setError(Boolean(result.error));
    setLoading(false);
  };

  onMount(() => void load());

  return (
    <ListPanel>
      <header class="grid gap-1 border-b border-line px-5 py-5 sm:px-6">
        <h2 class="heading-callout text-sm">
          {t('eventsuggestions.title')}
        </h2>
        <p class="text-muted">{t('eventsuggestions.description')}</p>
      </header>
      <Show when={!loading()} fallback={<LoadingState>{t('eventsuggestions.loading')}</LoadingState>}>
        <Show
          when={!error()}
          fallback={
            <p class="text-danger px-6 py-8">
              {t('eventsuggestions.error')}
            </p>
          }
        >
          <ListPanelList>
            <For
              each={items()}
              fallback={<li class="px-6 py-10 text-sm text-content-muted">{t('eventsuggestions.empty')}</li>}
            >
              {(item) => <EventSuggestionRow item={item} onDone={() => void load()} />}
            </For>
          </ListPanelList>
        </Show>
      </Show>
    </ListPanel>
  );
}
export default withLocale(EventSuggestionsAdminList);
