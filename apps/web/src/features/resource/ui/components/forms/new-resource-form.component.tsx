import { createForm, getValue, setResponse, setValue } from '@modular-forms/solid';
import { createSignal, Show } from 'solid-js';
import { Save, WandSparkles } from 'lucide-solid';

import Field from '@/shared/ui/components/forms/field.component.tsx';
import TagSelector from '@/shared/ui/components/forms/tag-selector.component.tsx';
import { createResource, loadResourceMetadata } from '@/features/resource/actions/resource.action.ts';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/resource/i18n';
import { createResourceSchema } from '@/features/resource/ui/schemas/forms.schema.ts';
import type { ResourceSubmitData } from '@/features/resource/ui/types/resource-submit.type.ts';
import { zodForm } from '@/shared/ui/forms/zod-form';

function NewResourceForm() {
  const { t, locale } = useI18n();
  const [metadataBusy, setMetadataBusy] = createSignal(false);
  const [metadataMessage, setMetadataMessage] = createSignal('');
  const [_form, { Form, Field: FormField }] = createForm<ResourceSubmitData>({
    initialValues: { title: '', description: '', url: '', tags: [] },
    validate: zodForm(createResourceSchema(locale())),
    validateOn: 'submit',
    revalidateOn: 'input',
  });

  const url = () => getValue(_form, 'url') ?? '';

  const autofillMetadata = async () => {
    const resourceUrl = url().trim();
    if (!resourceUrl || _form.submitting || metadataBusy()) return;

    setMetadataBusy(true);
    setMetadataMessage('');
    try {
      const metadata = await loadResourceMetadata(resourceUrl);
      if (metadata.title) setValue(_form, 'title', metadata.title);
      if (metadata.description) setValue(_form, 'description', metadata.description);
      setMetadataMessage(t('resourceform.metadataLoadedReview'));
    } catch {
      setMetadataMessage(t('resourceform.metadataCouldNotLoad'));
    } finally {
      setMetadataBusy(false);
    }
  };

  const submit = async (values: ResourceSubmitData) => {
    const result = await createResource({
      title: values.title.trim(),
      description: values.description.trim(),
      url: values.url.trim(),
      tagSlugs: values.tags ?? [],
    });
    if (result.kind === 'failure') {
      setResponse(_form, { status: 'error', message: t('resourceform.reviewRequiredFields') });
    }
  };

  return (
    <Form onSubmit={submit} class="space-y-5" aria-busy={_form.submitting}>
      <header class="border-b border-line pb-5">
        <p class="text-accent-label">{t('resourceform.newResource')}</p>
        <h1 class="heading-form-page mt-2">
          {t('resourceactions.createResource')}
        </h1>
      </header>

      <div class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div class="min-w-0 rounded-3xl border border-line bg-surface-elevated p-5 shadow-sm sm:p-6">
          <div class="mb-4 flex flex-wrap items-end justify-end gap-3">
            <button
             
              type="button"
              disabled={!url().trim() || _form.submitting || metadataBusy()}
             
              onClick={() => void autofillMetadata()} aria-busy={metadataBusy()} class="action action-secondary"
            >
              <WandSparkles class="size-4" aria-hidden="true" />
              {metadataBusy() ? t('resourceform.loadingMetadata') : t('resourceform.preFillMetadata')}
            </button>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <Field>
              <label for="resource-title" class="field-label">{t('resourceform.title')}</label>
              <FormField name="title">
                {(field, props) => (
                  <>
                    <input {...props} id="resource-title" placeholder={t('resourceform.exAstroDocs')}  class="field-control"/>
                    <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                  </>
                )}
              </FormField>
            </Field>
            <Field>
              <label for="resource-url" class="field-label">{t('resourceform.url')}</label>
              <FormField name="url">
                {(field, props) => (
                  <>
                    <input {...props} id="resource-url" type="url" placeholder="https://..."  class="field-control"/>
                    <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                  </>
                )}
              </FormField>
            </Field>
          </div>

          <div class="mt-4">
            <Field>
              <label for="resource-description" class="field-label">{t('resourceform.description')}</label>
              <FormField name="description">
                {(field, props) => (
                  <>
                    <textarea {...props} id="resource-description" rows={5}  class="field-control resize-y"/>
                    <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                  </>
                )}
              </FormField>
            </Field>
          </div>

          <div class="mt-4">
            <FormField name="tags" type="string[]">
              {(field) => (
                <>
                  <TagSelector
                    id="resource-tags"
                    value={field.value ?? []}
                    onChange={(value) => setValue(_form, 'tags', value)}
                    label={t('resourceform.tags')}
                  />
                  <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                </>
              )}
            </FormField>
          </div>

          <Show when={_form.response.status === 'error'}>
            <div class="mt-4">
              <p aria-live="polite" role="alert" class="text-danger">{_form.response.message}</p>
            </div>
          </Show>
          <Show when={metadataMessage()}>
            <p role="status" class="text-caption mt-3">
              {metadataMessage()}
            </p>
          </Show>
        </div>

        <aside class="lg:sticky lg:top-6">
          <section class="rounded-2xl border border-line bg-surface-elevated p-5">
            <h2 class="heading-tiny text-xs">
              {t('resourceform.status')}
            </h2>
            <p class="text-strong mt-4 flex items-center gap-2">
              <span class="size-2 rounded-full bg-action" />
              {t('resourceform.new')}
            </p>
            <div class="mt-5">
              <button type="submit" disabled={_form.submitting} aria-busy={_form.submitting} class="action action-primary">
                <Save class="size-4" />
                {t('resourceform.saveChanges')}
              </button>
            </div>
          </section>
        </aside>
      </div>
    </Form>
  );
}

export default withLocale(NewResourceForm);
