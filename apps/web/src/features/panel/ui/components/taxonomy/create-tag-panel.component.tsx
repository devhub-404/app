import { Plus } from 'lucide-solid';
import { createForm, reset, setValue } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { useI18n } from '@/features/panel/i18n';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import { createTaxonomySchemas, type CreateTagFormInput } from '@/features/panel/ui/schemas/forms.schema.ts';
import { slugify } from '@utilify/core';
import { createSignal } from 'solid-js';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import ListPanelHeader from '@/shared/ui/components/surfaces/list-panel-header.component.tsx';
import PanelHeading from '@/shared/ui/components/surfaces/panel-heading.component.tsx';

export default function CreateTagPanel(props: {
  busy: boolean;
  onCreate: (name: string, slug: string) => Promise<boolean>;
}) {
  const { t, locale } = useI18n();
  const schema = createTaxonomySchemas(locale()).createTag;
  const [slugEdited, setSlugEdited] = createSignal(false);
  const [_form, { Form, Field: FormField }] = createForm<CreateTagFormInput>({
    validate: zodForm(schema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });
  const create = async (value: CreateTagFormInput) => {
    if (await props.onCreate(value.name.trim(), value.slug.trim())) {
      reset(_form);
      setSlugEdited(false);
    }
  };
  return (
    <ListPanel>
      <ListPanelHeader>
        <PanelHeading title={t('taxonomytags.createTag')} description={t('taxonomytags.addNewIdentityTechnical')} />
      </ListPanelHeader>
      <div class="p-5 sm:p-6">
        <Form onSubmit={create} class="grid gap-4 sm:grid-cols-2 sm:items-end">
          <Field>
            <label for="taxonomy-new-tag-name" class="field-label">{t('taxonomytags.name')}</label>
            <FormField name="name">
              {(_, fieldProps) => (
                <input
                  {...fieldProps}
                  id="taxonomy-new-tag-name"
                  onInput={(event) => {
                    fieldProps.onInput(event);
                    if (!slugEdited()) setValue(_form, 'slug', slugify(event.currentTarget.value));
                  }}
                 class="field-control"/>
              )}
            </FormField>
          </Field>
          <Field>
            <label for="taxonomy-new-tag-slug" class="field-label">{t('taxonomytags.slugCanonical')}</label>
            <FormField name="slug">
              {(_, fieldProps) => (
                <input
                  {...fieldProps}
                  id="taxonomy-new-tag-slug"
                  onInput={(event) => {
                    setSlugEdited(true);
                    fieldProps.onInput(event);
                  }}
                 class="field-control"/>
              )}
            </FormField>
          </Field>
          <div class="sm:col-span-2 sm:flex sm:justify-end">
            <button type="submit" disabled={props.busy} class="action action-primary">
              <Plus class="size-4" aria-hidden="true" />
              {t('taxonomytags.createTag')}
            </button>
          </div>
        </Form>
      </div>
    </ListPanel>
  );
}
