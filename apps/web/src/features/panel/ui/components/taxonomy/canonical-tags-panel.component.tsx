import { Pencil, Save, Trash, X } from 'lucide-solid';
import { For, Show, createSignal } from 'solid-js';
import { createForm, reset, setValues } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import type { TagDTO } from '@/shared/taxonomy/public';
import { useI18n } from '@/features/panel/i18n';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import ListPanelHeader from '@/shared/ui/components/surfaces/list-panel-header.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';
import PanelHeading from '@/shared/ui/components/surfaces/panel-heading.component.tsx';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import EmptyState from '@/shared/ui/components/feedback/empty-state.component.tsx';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import { createTaxonomySchemas, type UpdateTagFormInput } from '@/features/panel/ui/schemas/forms.schema.ts';
import { Pagination } from '@ark-ui/solid/pagination';

export default function CanonicalTagsPanel(props: {
  items: TagDTO[];
  loading: boolean;
  busy: boolean;
  onUpdate: (id: string, name: string, slug: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const { t, locale } = useI18n();
  const schema = createTaxonomySchemas(locale()).updateTag;
  const [editingId, setEditingId] = createSignal<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = createSignal<string | null>(null);
  const [_form, { Form, Field: FormField }] = createForm<UpdateTagFormInput>({
    validate: zodForm(schema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });

  const save = async (value: UpdateTagFormInput) => {
    const id = editingId();
    if (id && (await props.onUpdate(id, value.name.trim(), value.slug.trim()))) {
      setEditingId(null);
      reset(_form);
    }
  };
  const remove = async (id: string) => {
    if (await props.onDelete(id)) setDeleteCandidate(null);
  };

  return (
    <ListPanel aria-labelledby="tags-list-heading">
      <ListPanelHeader>
        <PanelHeading
          id="tags-list-heading"
          title={t('taxonomytags.tagsCanonical')}
          description={`${props.total} ${t('taxonomytags.resultS')}`}
        />
      </ListPanelHeader>
      <Show when={!props.loading} fallback={<LoadingState>{t('taxonomytags.loadingTags')}</LoadingState>}>
        <ListPanelList>
          <For
            each={props.items}
            fallback={
              <EmptyState>
                <p class="text-strong">{t('taglifecyclepanel.noTagFound')}</p>
                <p class="text-muted mt-1">
                  {t('taxonomytags.adjustSearchOrCreateNewTag')}
                </p>
              </EmptyState>
            }
          >
            {(item) => (
              <li class="px-5 py-5 sm:px-6">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div class="min-w-0">
                    <p class="text-strong truncate">
                      {item.name}
                    </p>
                    <p class="text-caption mt-1">
                      /{item.slug} · {item.status}
                    </p>
                  </div>
                  <div class="flex shrink-0 gap-2">
                    <button
                     
                      type="button"
                      onClick={() => {
                        setEditingId(item.id);
                        setValues(_form, { name: item.name, slug: item.slug });
                        setDeleteCandidate(null);
                      }} class="action action-secondary"
                    >
                      <Pencil class="size-4" aria-hidden="true" />
                      {t('newsadminlist.edit')}
                    </button>
                    <button
                     
                      type="button"
                      disabled={props.busy}
                      onClick={() => setDeleteCandidate(item.id)} class="action action-danger-outline"
                    >
                      <Trash class="size-4" aria-hidden="true" />
                      {t('resourceadmindetail.delete')}
                    </button>
                  </div>
                </div>
                <Show when={editingId() === item.id}>
                  <Form
                    onSubmit={save}
                    class="mt-4 flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3 sm:flex-row"
                  >
                    <div class="min-w-0 flex-1">
                      <Field>
                        <label for={`taxonomy-tag-name-${item.id}`} class="field-label">{t('taxonomytags.name')}</label>
                        <FormField name="name">
                          {(_, fieldProps) => <input {...fieldProps} id={`taxonomy-tag-name-${item.id}`}  class="field-control"/>}
                        </FormField>
                      </Field>
                    </div>
                    <div class="min-w-0 flex-1">
                      <Field>
                        <label for={`taxonomy-tag-slug-${item.id}`} class="field-label">{t('taxonomytags.slugCanonical')}</label>
                        <FormField name="slug">
                          {(_, fieldProps) => <input {...fieldProps} id={`taxonomy-tag-slug-${item.id}`}  class="field-control"/>}
                        </FormField>
                      </Field>
                    </div>
                    <div class="flex items-end gap-2">
                      <button type="submit" disabled={props.busy} class="action action-primary">
                        <Save class="size-4" aria-hidden="true" />
                        {t('taxonomytags.save')}
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} class="action action-secondary">
                        <X class="size-4" aria-hidden="true" />
                        <X class="size-4" aria-hidden="true" />
                        {t('resourceadmindetail.cancel')}
                      </button>
                    </div>
                  </Form>
                </Show>
                <Show when={deleteCandidate() === item.id}>
                  <div class="mt-4 flex flex-col gap-3 rounded-2xl border border-danger-border bg-danger-bg p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p class="text-muted">
                      {t('resourceadmindetail.delete')} <strong class="text-content">{item.name}</strong>{' '}
                      {t('taxonomytags.permanently')}
                    </p>
                    <div class="flex gap-2">
                      <button type="button" disabled={props.busy} onClick={() => void remove(item.id)} class="action action-danger">
                        <Trash class="size-4" aria-hidden="true" />
                        {t('resourceadmindetail.confirmDeletion')}
                      </button>
                      <button type="button" onClick={() => setDeleteCandidate(null)} class="action action-secondary">
                        {t('resourceadmindetail.cancel')}
                      </button>
                    </div>
                  </div>
                </Show>
              </li>
            )}
          </For>
        </ListPanelList>
        <Show when={props.total > props.pageSize}>
          <Pagination.Root
            count={props.total}
            pageSize={props.pageSize}
            page={props.page}
            onPageChange={(details) => props.onPageChange(details.page)}
            class="flex items-center justify-center gap-2 border-t border-line px-5 py-4"
          >
            <Pagination.PrevTrigger class="rounded-xl border border-line px-3 py-2 text-sm text-content-muted disabled:opacity-50">
              {t('userslist.previous')}
            </Pagination.PrevTrigger>
            <span class="text-sm text-content-muted">
              {props.page} {t('taxonomytags.in')} {Math.ceil(props.total / props.pageSize)}
            </span>
            <Pagination.NextTrigger class="rounded-xl border border-line px-3 py-2 text-sm text-content-muted disabled:opacity-50">
              {t('userslist.next')}
            </Pagination.NextTrigger>
          </Pagination.Root>
        </Show>
      </Show>
    </ListPanel>
  );
}
