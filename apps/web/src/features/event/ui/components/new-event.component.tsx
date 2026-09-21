import { Show } from 'solid-js';
import { createForm, getValue, setResponse, setValue } from '@modular-forms/solid';
import { createEvent, submitEventSuggestion } from '@/features/event/actions/event.action.ts';
import { routes } from '@/shared/navigation/routes';
import { redirectTo } from '@/shared/utils/redirect.util.ts';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/event/i18n';
import { Send } from 'lucide-solid';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import Select from '@/shared/ui/components/forms/select.component.tsx';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { createEventFormSchema, type EventFormInput } from '@/features/event/ui/schemas/forms.schema.ts';

function NewEvent(props: { direct?: boolean }) {
  const { t, locale } = useI18n();
  const schema = createEventFormSchema(locale(), Boolean(props.direct));
  const [_form, { Form }] = createForm<EventFormInput>({
    initialValues: { url: '', title: '', description: '', startsAt: '', endsAt: '', format: 'online' },
    validate: zodForm(schema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });
  const url = () => getValue(_form, 'url') ?? '';
  const title = () => getValue(_form, 'title') ?? '';
  const description = () => getValue(_form, 'description') ?? '';
  const startsAt = () => getValue(_form, 'startsAt') ?? '';
  const endsAt = () => getValue(_form, 'endsAt') ?? '';
  const format = () => getValue(_form, 'format') ?? 'online';

  const submit = async (values: EventFormInput) => {
    try {
      if (props.direct) {
        const result = await createEvent({
          title: values.title.trim(),
          description: values.description.trim(),
          url: values.url.trim(),
          startsAt: new Date(values.startsAt).toISOString(),
          endsAt: new Date(values.endsAt).toISOString(),
          format: values.format,
        });
        if (result.kind === 'failure') {
          setResponse(_form, { status: 'error', message: t('newevent.couldNotSendSuggestionCheckUrltryAgain') });
        }
        else redirectTo(routes.events);
      } else {
        const result = await submitEventSuggestion({ url: values.url.trim() });
        const ok = result.kind === 'success';
        if (!ok) setResponse(_form, { status: 'error', message: t('newevent.couldNotSendSuggestionCheckUrltryAgain') });
        else redirectTo(routes.account.eventSuggestions);
      }
    } catch {
      setResponse(_form, { status: 'error', message: t('newevent.couldNotSendSuggestion') });
    }
  };

  return (
    <Form onSubmit={submit} class="grid gap-5 rounded-3xl border border-line bg-surface-elevated p-6">
      <header class="grid gap-2">
        <h2 class="heading-tiny text-xs">
          {props.direct ? t('newevent.createEditorial') : t('events.suggestEventAction')}
        </h2>
        <p class="text-muted">
          {props.direct
            ? t('newevent.createEditorialDescription')
            : t('newevent.sendUrlOfficialOrVerifiableTeamCompleteDataBeforePublication')}
        </p>
      </header>
      <Field>
        <label for="event-url" class="field-label">{t('newevent.urlOfficial')}</label>
        <input
          id="event-url"
          required
          type="url"
          value={url()}
          onInput={(event) => {
            setValue(_form, 'url', event.currentTarget.value);
          }}
          placeholder="https://..."
         class="field-control"/>
      </Field>
      <Show when={props.direct}>
        <Field>
          <label for="event-title" class="field-label">{t('newevent.title')}</label>
          <input
            id="event-title"
            required
            value={title()}
            onInput={(event) => {
              setValue(_form, 'title', event.currentTarget.value);
            }}
           class="field-control"/>
        </Field>
        <Field>
          <label for="event-description" class="field-label">{t('newevent.description')}</label>
          <textarea
            id="event-description"
            required
            rows={5}
            value={description()}
            onInput={(event) => {
              setValue(_form, 'description', event.currentTarget.value);
            }}
           class="field-control resize-y"/>
        </Field>
        <div class="grid gap-4 sm:grid-cols-2">
          <Field>
            <label for="event-start" class="field-label">{t('newevent.startsAt')}</label>
            <input
              id="event-start"
              type="datetime-local"
              required
              value={startsAt()}
              onInput={(event) => {
                setValue(_form, 'startsAt', event.currentTarget.value);
              }}
             class="field-control"/>
          </Field>
          <Field>
            <label for="event-end" class="field-label">{t('newevent.endsAt')}</label>
            <input
              id="event-end"
              type="datetime-local"
              required
              value={endsAt()}
              onInput={(event) => {
                setValue(_form, 'endsAt', event.currentTarget.value);
              }}
             class="field-control"/>
          </Field>
        </div>
        <Field>
          <label for="event-format" class="field-label">{t('newevent.format')}</label>
          <Select<EventFormInput['format']>
            id="event-format"
            value={format()}
            ariaLabel={t('newevent.format')}
            options={[
              { value: 'online', label: t('events.online') },
              { value: 'in_person', label: t('events.onsite') },
              { value: 'hybrid', label: t('events.hybrid') },
            ]}
            onChange={(value) => {
              setValue(_form, 'format', value as EventFormInput['format']);
            }}
          />
        </Field>
      </Show>
      <Show when={_form.response.status === 'error'}>
        <p role="alert" class="text-danger">{_form.response.message}</p>
      </Show>
      <div class="flex justify-end">
        <button disabled={_form.submitting} aria-busy={_form.submitting} class="action action-primary">
          <Send class="size-4" />
          {_form.submitting
            ? t('event.sending')
            : props.direct
              ? t('newevent.createEvent')
              : t('newevent.sendSuggestion')}
        </button>
      </div>
    </Form>
  );
}
export default withLocale(NewEvent);
