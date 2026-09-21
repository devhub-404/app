import { Check, RefreshCcw, X } from 'lucide-solid';
import { For, Show, createSignal, onMount } from 'solid-js';
import { createForm, reset } from '@modular-forms/solid';
import { acceptNewsSuggestion, loadPendingNewsSuggestions, rejectNewsSuggestion } from '@/features/news/public';
import type { NewsSuggestionDTO } from '@/features/news/public';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/panel/i18n';
import {
  createNewsSuggestionReviewSchema,
  type NewsSuggestionReviewFormInput,
} from '@/features/panel/ui/schemas/forms.schema.ts';
import { zodForm } from '@/shared/ui/forms/zod-form';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';

function SuggestionRow(props: { suggestion: NewsSuggestionDTO; onDone: () => void }) {
  const { t, locale } = useI18n();
  const [editing, setEditing] = createSignal(false);
  const [busy, setBusy] = createSignal(false);
  const [form, { Form, Field: FormField }] = createForm<NewsSuggestionReviewFormInput>({
    validate: zodForm(createNewsSuggestionReviewSchema(locale())),
  });

  const accept = async (values: NewsSuggestionReviewFormInput) => {
    if (busy()) return;
    setBusy(true);
    try {
      const ok = await acceptNewsSuggestion(props.suggestion.id, {
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        content: values.content.trim() || undefined,
      });
      if (ok.kind === 'success') {
        reset(form);
        props.onDone();
      }
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    if (busy()) return;
    setBusy(true);
    try {
      if ((await rejectNewsSuggestion(props.suggestion.id)).kind === 'success') props.onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <li class="grid gap-4 px-5 py-5 sm:px-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <a
          class="min-w-0 break-all text-sm font-semibold text-content-accent hover:underline"
          href={props.suggestion.url}
          target="_blank"
          rel="noreferrer"
        >
          {props.suggestion.url}
        </a>
        <div class="flex shrink-0 gap-2">
          <button type="button" disabled={busy()} onClick={() => void reject()} class="action action-secondary">
            <X class="size-3.5" aria-hidden="true" />
            {t('codexproposals.reject')}
          </button>
          <button type="button" disabled={busy()} onClick={() => setEditing((value) => !value)} class="action action-primary">
            <Check class="size-3.5" aria-hidden="true" />
            {t('newssuggestionsadminlist.accept')}
          </button>
        </div>
      </div>
      <Show when={editing()}>
        <Form onSubmit={accept} class="grid gap-4 rounded-2xl border border-line bg-surface p-4">
          <FormField name="title">
            {(field, fieldProps) => (
              <Field>
                <label for={`news-suggestion-title-${props.suggestion.id}`} class="field-label">
                  {t('newssuggestionsadminlist.title')}
                </label>
                <input
                  {...fieldProps}
                  id={`news-suggestion-title-${props.suggestion.id}`}
                  value={field.value ?? ''}
                  required
                  aria-invalid={Boolean(field.error)}
                 class="field-control"/>
                {field.error ? <p class="text-danger">{field.error}</p> : null}
              </Field>
            )}
          </FormField>
          <FormField name="description">
            {(field, fieldProps) => (
              <Field>
                <label for={`news-suggestion-description-${props.suggestion.id}`} class="field-label">
                  {t('newssuggestionsadminlist.description')}
                </label>
                <textarea
                  {...fieldProps}
                  id={`news-suggestion-description-${props.suggestion.id}`}
                  rows={3}
                  value={field.value ?? ''}
                 class="field-control resize-y"/>
              </Field>
            )}
          </FormField>
          <FormField name="content">
            {(field, fieldProps) => (
              <Field>
                <label for={`news-suggestion-content-${props.suggestion.id}`} class="field-label">
                  {t('newssuggestionsadminlist.content')}
                </label>
                <textarea
                  {...fieldProps}
                  id={`news-suggestion-content-${props.suggestion.id}`}
                  rows={6}
                  value={field.value ?? ''}
                 class="field-control resize-y"/>
              </Field>
            )}
          </FormField>
          <div class="flex justify-end">
            <button type="submit" disabled={busy()} aria-busy={busy()} class="action action-primary">
              {busy() ? t('newssuggestionsadminlist.accepting') : t('newssuggestionsadminlist.createDraft')}
            </button>
          </div>
        </Form>
      </Show>
    </li>
  );
}

function NewsSuggestionsAdminList() {
  const { t } = useI18n();
  const [items, setItems] = createSignal<NewsSuggestionDTO[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(false);
  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await loadPendingNewsSuggestions();
      result.error ? setError(true) : setItems(result.items);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  onMount(() => void load());
  return (
    <ListPanel>
      <header class="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-5 sm:px-6">
        <div class="grid gap-1">
          <h2 class="heading-callout text-sm">
            {t('newssuggestionsadminlist.suggestionsNews')}
          </h2>
          <p class="text-muted">{t('newssuggestionsadminlist.reviewUrlsSubmittedByCommunity')}</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading()} class="action action-secondary">
          <RefreshCcw class="size-3.5" aria-hidden="true" />
          {t('newssuggestionsadminlist.update')}
        </button>
      </header>
      <Show
        when={!loading()}
        fallback={<LoadingState>{t('newssuggestionsadminlist.loadingSuggestions')}</LoadingState>}
      >
        <Show
          when={!error()}
          fallback={
            <p class="text-danger px-6 py-8">
              {t('newssuggestionsadminlist.couldNotLoadSuggestions')}
            </p>
          }
        >
          <ListPanelList>
            <For
              each={items()}
              fallback={
                <li class="px-6 py-8 text-sm text-content-muted">
                  {t('newssuggestionsadminlist.noSuggestionPending')}
                </li>
              }
            >
              {(suggestion) => <SuggestionRow suggestion={suggestion} onDone={() => void load()} />}
            </For>
          </ListPanelList>
        </Show>
      </Show>
    </ListPanel>
  );
}
export default withLocale(NewsSuggestionsAdminList);
