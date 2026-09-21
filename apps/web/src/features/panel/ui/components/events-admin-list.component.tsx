import { createForm, setValue, setValues } from '@modular-forms/solid';
import DestructiveDialog from '@/shared/ui/components/dialogs/destructive-dialog.component.tsx';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import Select from '@/shared/ui/components/forms/select.component.tsx';
import { createSignal, For, onMount, Show } from 'solid-js';
import { Dialog } from '@ark-ui/solid/dialog';
import { Archive, Check, ExternalLink, Pencil, Trash } from 'lucide-solid';
import { deleteEvent, listEventsManagementQuery, reviewEvent, updateEvent, type Event } from '@/features/event/public';
import type { ActorRole } from '@/features/auth/public';
import { canDeleteEvent, canEditEvent, canReviewEventSuggestions } from '@/features/event/public';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/panel/i18n';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import ListPanelHeader from '@/shared/ui/components/surfaces/list-panel-header.component.tsx';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import PanelHeading from '@/shared/ui/components/surfaces/panel-heading.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { createEventAdminFormSchema, type EventAdminFormInput } from '@/features/panel/ui/schemas/event-forms.schema.ts';

function EventsAdminList(props: { role: ActorRole | null }) {
  const { t, locale } = useI18n();
  const [items, setItems] = createSignal<Event[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(false);
  const [busyId, setBusyId] = createSignal<string | null>(null);
  const [editing, setEditing] = createSignal<Event | null>(null);
  const [deleting, setDeleting] = createSignal<Event | null>(null);
  const [_form, { Form, Field: FormField }] = createForm<EventAdminFormInput>({
    initialValues: { title: '', description: '', url: '', startsAt: '', endsAt: '', format: 'online' },
    validate: zodForm(createEventAdminFormSchema(locale())),
    validateOn: 'submit',
    revalidateOn: 'input',
  });
  const actor = () => ({ accountId: null, role: props.role, organizationIds: [] as string[] });
  const canEdit = () => canEditEvent(actor());
  const canDelete = () => canDeleteEvent(actor());

  const load = async () => {
    setLoading(true);
    const result = await listEventsManagementQuery({ page: 1, pageSize: 30 });
    setItems(result.items);
    setError(Boolean(result.error));
    setLoading(false);
  };
  onMount(() => void load());

  const review = async (item: Event, status: 'published' | 'archived') => {
    if (busyId() || !canReviewEventSuggestions(actor())) return;
    setBusyId(item.id);
    const result = await reviewEvent(item.id, { status });
    setBusyId(null);
    if (result) await load();
  };
  const beginEdit = (item: Event) => {
    if (!canEditEvent(actor())) return;
    setEditing(item);
    setValues(_form, {
      title: item.title,
      description: item.description,
      url: item.url,
      startsAt: item.startsAt.slice(0, 16),
      endsAt: item.endsAt.slice(0, 16),
      format: item.format,
    });
  };
  const save = async (values: EventAdminFormInput) => {
    const item = editing();
    if (!item || busyId() || !canEditEvent(actor())) return;
    setBusyId(item.id);
    const result = await updateEvent(item.id, {
      title: values.title.trim(),
      description: values.description.trim(),
      url: values.url.trim(),
      startsAt: new Date(values.startsAt).toISOString(),
      endsAt: new Date(values.endsAt).toISOString(),
      format: values.format,
    });
    setBusyId(null);
    if (result.kind === 'success') {
      setEditing(null);
      await load();
    }
  };
  const remove = async () => {
    const item = deleting();
    if (!item || busyId() || !canDeleteEvent(actor())) return;
    setBusyId(item.id);
    const result = await deleteEvent(item.id);
    setBusyId(null);
    if (result.kind === 'success') {
      setDeleting(null);
      await load();
    }
  };

  return (
    <ListPanel>
      <ListPanelHeader>
        <PanelHeading
          title={t('eventsadminlist.events')}
          description={t('eventsadminlist.inventoryStatusTemporalEventsPublished')}
        />
      </ListPanelHeader>
      <Show when={!loading()} fallback={<LoadingState>{t('eventsadminlist.loadingEvents')}</LoadingState>}>
        <Show
          when={!error()}
          fallback={
            <p class="text-danger px-6 py-8">
              {t('eventsadminlist.couldNotLoadEvents')}
            </p>
          }
        >
          <ListPanelList>
            <For
              each={items()}
              fallback={<li class="px-6 py-10 text-sm text-content-muted">{t('eventsadminlist.noEventRegistered')}</li>}
            >
              {(item) => (
                <li class="grid gap-3 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6">
                  <div class="grid min-w-0 gap-1">
                    <p class="text-strong truncate">
                      {item.title}
                    </p>
                    <p class="text-caption">
                      {item.format} · {item.temporalState} · {item.status}
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-2 sm:justify-end">
                    <Show when={item.slug}>
                      <a
                        class="inline-flex min-h-9 items-center gap-2 rounded-lg border border-line px-3 text-xs font-semibold text-content hover:border-action-border hover:text-content-accent"
                        href={`/events/${encodeURIComponent(item.slug)}`}
                      >
                        <ExternalLink class="size-3.5" aria-hidden="true" />
                        {t('eventsadminlist.open')}
                      </a>
                    </Show>
                    <Show when={canEdit()}>
                      <button disabled={busyId() === item.id} onClick={() => beginEdit(item)} class="action action-secondary">
                        <Pencil class="size-3.5" aria-hidden="true" />
                        {t('eventsadminlist.edit')}
                      </button>
                    </Show>
                    <Show when={item.status === 'draft' && canEdit()}>
                      <button
                       
                        disabled={busyId() === item.id}
                        onClick={() => void review(item, 'published')} class="action action-secondary"
                      >
                        <Check class="size-3.5" aria-hidden="true" />
                        {t('eventsadminlist.approve')}
                      </button>
                    </Show>
                    <Show when={item.status === 'published' && canEdit()}>
                      <button
                       
                        disabled={busyId() === item.id}
                        onClick={() => void review(item, 'archived')} class="action action-secondary"
                      >
                        <Archive class="size-3.5" aria-hidden="true" />
                        {t('eventsadminlist.archive')}
                      </button>
                    </Show>
                    <Show when={canDelete()}>
                      <button
                       
                        disabled={busyId() === item.id}
                        onClick={() => setDeleting(item)} class="action action-danger-outline"
                      >
                        <Trash class="size-3.5" aria-hidden="true" />
                        {t('eventsadminlist.delete')}
                      </button>
                    </Show>
                  </div>
                </li>
              )}
            </For>
          </ListPanelList>
        </Show>
      </Show>

      <Show when={editing()}>
        {(item) => (
          <Dialog.Root
            open={true}
            onOpenChange={(details) => {
              if (!details.open && !busyId()) setEditing(null);
            }}
          >
            <Dialog.Backdrop class="fixed inset-0 z-50 bg-scrim" />
            <Dialog.Positioner class="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4 sm:p-6">
              <Dialog.Content class="grid max-h-[90vh] w-full max-w-2xl gap-5 overflow-y-auto rounded-3xl border border-line bg-surface-elevated p-6 shadow-ui-overlay">
                <header class="grid gap-1">
                  <Dialog.Title class="text-lg font-semibold text-content">
                    {t('eventsadminlist.editEvent')}
                  </Dialog.Title>
                  <Dialog.Description class="text-sm text-content-muted">{item().title}</Dialog.Description>
                </header>
                <Form class="grid gap-4" onSubmit={save}>
                  <FormField name="title">
                    {(field, fieldProps) => (
                      <Field>
                        <label for="event-admin-title" class="field-label">{t('eventsadminlist.title')}</label>
                        <input {...fieldProps} id="event-admin-title" required value={field.value ?? ''}  class="field-control"/>
                      </Field>
                    )}
                  </FormField>
                  <FormField name="description">
                    {(field, fieldProps) => (
                      <Field>
                        <label for="event-admin-description" class="field-label">{t('eventsadminlist.description')}</label>
                        <textarea
                          {...fieldProps}
                          id="event-admin-description"
                          required
                          rows={5}
                          value={field.value ?? ''}
                         class="field-control resize-y"/>
                      </Field>
                    )}
                  </FormField>
                  <FormField name="url">
                    {(field, fieldProps) => (
                      <Field>
                        <label for="event-admin-url" class="field-label">{t('eventsadminlist.url')}</label>
                        <input {...fieldProps} id="event-admin-url" type="url" required value={field.value ?? ''}  class="field-control"/>
                      </Field>
                    )}
                  </FormField>
                  <div class="grid gap-4 sm:grid-cols-2">
                    <FormField name="startsAt">
                      {(field, fieldProps) => (
                        <Field>
                          <label for="event-admin-start" class="field-label">{t('eventsadminlist.startsAt')}</label>
                          <input
                            {...fieldProps}
                            id="event-admin-start"
                            type="datetime-local"
                            required
                            value={field.value ?? ''}
                           class="field-control"/>
                        </Field>
                      )}
                    </FormField>
                    <FormField name="endsAt">
                      {(field, fieldProps) => (
                        <Field>
                          <label for="event-admin-end" class="field-label">{t('eventsadminlist.endsAt')}</label>
                          <input
                            {...fieldProps}
                            id="event-admin-end"
                            type="datetime-local"
                            required
                            value={field.value ?? ''}
                           class="field-control"/>
                        </Field>
                      )}
                    </FormField>
                  </div>
                  <FormField name="format">
                    {(field) => (
                      <Field>
                        <label for="event-admin-format" class="field-label">{t('eventsadminlist.format')}</label>
                        <Select
                          id="event-admin-format"
                          value={field.value ?? 'online'}
                          options={[
                            { value: 'online', label: t('eventformat.online') },
                            { value: 'in_person', label: t('eventformat.inPerson') },
                            { value: 'hybrid', label: t('eventformat.hybrid') },
                          ]}
                          onChange={(value) => setValue(_form, 'format', value)}
                        />
                      </Field>
                    )}
                  </FormField>
                  <footer class="flex justify-end gap-2">
                    <Dialog.CloseTrigger
                      asChild={(triggerProps) => (
                        <button {...triggerProps} type="button" disabled={Boolean(busyId())} class="action action-secondary">
                          {t('eventsadminlist.cancel')}
                        </button>
                      )}
                    />
                    <button type="submit" disabled={busyId() === item().id} class="action action-primary">
                      {t('eventsadminlist.save')}
                    </button>
                  </footer>
                </Form>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Root>
        )}
      </Show>
      <Show when={deleting()}>
        {(item) => (
          <DestructiveDialog
            open={true}
            onOpenChange={(open) => !open && setDeleting(null)}
            titleId="delete-event-title"
            accessibleLabel={t('eventsadminlist.deleteEvent')}
            title={t('eventsadminlist.deleteEvent')}
            description={item().title}
            confirmLabel={t('eventsadminlist.delete')}
            cancelLabel={t('eventsadminlist.cancel')}
            busy={busyId() === item().id}
            confirmDisabled={!canDelete()}
            onConfirm={() => void remove()}
          />
        )}
      </Show>
    </ListPanel>
  );
}
export default withLocale(EventsAdminList);
