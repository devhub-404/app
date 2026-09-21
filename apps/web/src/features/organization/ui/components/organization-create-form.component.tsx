import { Plus } from 'lucide-solid';
import { Show } from 'solid-js';
import { createForm, setResponse, setValue } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { createOrganizationCommand } from '@/features/organization/actions/organization.action.ts';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/organization/i18n';
import { redirectTo } from '@/shared/utils/redirect.util.ts';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import Select from '@/shared/ui/components/forms/select.component.tsx';
import { createOrganizationFormSchema, type OrganizationFormInput } from '@/features/organization/ui/schemas/forms.schema.ts';

function OrganizationCreateForm() {
  const { t, locale } = useI18n();
  const [_form, { Form, Field: FormField }] = createForm<OrganizationFormInput>({
    validate: zodForm(createOrganizationFormSchema(locale())),
    validateOn: 'submit',
    revalidateOn: 'input',
  });

  const submit = async (values: OrganizationFormInput) => {
    try {
      const result = await createOrganizationCommand({
        ...values,
        name: values.name.trim(),
        description: values.description.trim(),
        websiteUrl: values.websiteUrl?.trim() || null,
      });
      if (!result.ok) {
        setResponse(_form, { status: 'error', message: t('organizationcreateform.couldNotCreateOrganization') });
        return;
      }
      redirectTo(`/organizations/${encodeURIComponent(result.data.slug)}`);
    } catch {
      setResponse(_form, { status: 'error', message: t('organizationcreateform.couldNotCreateOrganization') });
    }
  };

  return (
    <Form onSubmit={submit} class="mx-auto max-w-2xl space-y-4">
      <Field>
        <label for="organization-name" class="field-label">{t('organizationcreateform.name')}</label>
        <FormField name="name">
          {(_, props) => <input {...props} id="organization-name" required minlength="2" maxlength="160"  class="field-control"/>}
        </FormField>
      </Field>
      <Field>
        <label for="organization-type" class="field-label">{t('organizationcreateform.type')}</label>
        <FormField name="type">
          {(field) => (
            <Select<OrganizationFormInput['type']>
              id="organization-type"
              value={field.value ?? 'company'}
              ariaLabel={t('organizationcreateform.type')}
              options={[
                { value: 'company', label: t('organizationcreateform.company') },
                { value: 'community', label: t('organizationcreateform.community') },
                { value: 'open_source', label: t('organizationcreateform.openSource') },
                { value: 'foundation', label: t('organizationcreateform.foundation') },
                { value: 'group', label: t('organizationcreateform.group') },
                { value: 'institution', label: t('organizationcreateform.institution') },
                { value: 'other', label: t('organizationcreateform.other') },
              ]}
              onChange={(value) => setValue(_form, 'type', value)}
            />
          )}
        </FormField>
      </Field>
      <Field>
        <label for="organization-description" class="field-label">{t('organizationcreateform.description')}</label>
        <FormField name="description">
          {(_, props) => <textarea {...props} id="organization-description" required rows="6"  class="field-control resize-y"/>}
        </FormField>
      </Field>
      <Field>
        <label for="organization-website" class="field-label">{t('organizationcreateform.website')}</label>
        <FormField name="websiteUrl">
          {(_, props) => <input {...props} id="organization-website" type="url"  class="field-control"/>}
        </FormField>
      </Field>
      <Show when={_form.response.status === 'error'}>
        <p role="alert" class="text-danger">{_form.response.message}</p>
      </Show>
      <button disabled={_form.submitting} aria-busy={_form.submitting} class="action action-primary">
        <Plus class="size-4" aria-hidden="true" />
        {_form.submitting ? t('organization.creating') : t('organizationcreateform.createOrganization')}
      </button>
    </Form>
  );
}

export default withLocale(OrganizationCreateForm);
