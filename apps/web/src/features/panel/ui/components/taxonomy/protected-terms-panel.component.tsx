import { ShieldCheck, Trash } from 'lucide-solid';
import { createForm, reset, setValue } from '@modular-forms/solid';
import { For } from 'solid-js';
import { zodForm } from '@/shared/ui/forms/zod-form';
import type { TagIdentityTermDTO } from '@/shared/taxonomy/public';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import Select from '@/shared/ui/components/forms/select.component.tsx';
import { useI18n } from '@/features/panel/i18n';
import TaxonomyToolPanel from './taxonomy-tool-panel.component.tsx';
import { createTaxonomySchemas, type ProtectedTermFormInput } from '@/features/panel/ui/schemas/forms.schema.ts';

export default function ProtectedTermsPanel(props: {
  terms: TagIdentityTermDTO[];
  busy: boolean;
  locale: 'pt' | 'en' | 'es';
  onAdd: (value: string, kind: 'reserved' | 'blocked') => Promise<boolean>;
  onRemove: (id: string) => void;
}) {
  const { t } = useI18n();
  const schema = createTaxonomySchemas(props.locale).protectedTerm;
  const [_form, { Form, Field: FormField }] = createForm<ProtectedTermFormInput>({
    validate: zodForm(schema),
    validateOn: 'submit',
    revalidateOn: 'input',
    initialValues: { value: '', kind: 'reserved' },
  });
  const add = async (value: ProtectedTermFormInput) => {
    if (await props.onAdd(value.value.trim(), value.kind)) {
      reset(_form);
    }
  };
  return (
    <TaxonomyToolPanel
      title={t('taxonomytags.termsProtected')}
      description={t('taxonomytags.avoidIdentitiesReservedOrBlocked')}
      form={
        <Form onSubmit={add} class="grid gap-4 sm:grid-cols-2 sm:items-end">
          <Field>
            <label for="taxonomy-protected-term" class="field-label">{t('taxonomytags.term')}</label>
            <FormField name="value">
              {(_, fieldProps) => <input {...fieldProps} id="taxonomy-protected-term"  class="field-control"/>}
            </FormField>
          </Field>
          <FormField name="kind">
            {(field) => (
              <Select
                id="taxonomy-term-policy"
                label={t('taxonomytags.policy')}
                value={field.value ?? 'reserved'}
                options={[
                  { value: 'reserved', label: t('taxonomytags.reserved') },
                  { value: 'blocked', label: t('taxonomytags.blocked') },
                ]}
                onChange={(value) => setValue(_form, 'kind', value)}
              />
            )}
          </FormField>
          <button type="submit" disabled={props.busy} class="action action-primary">
            <ShieldCheck class="size-4" aria-hidden="true" />
            {t('taxonomytags.protectTerm')}
          </button>
        </Form>
      }
    >
      <For
        each={props.terms}
        fallback={<li class="px-4 py-3 text-sm text-content-muted">{t('taxonomytags.noTermProtected')}</li>}
      >
        {(term) => (
          <li class="flex items-center justify-between gap-2 px-4 py-3 text-sm">
            <span>
              <strong>{term.value}</strong> · {term.kind}
            </span>
            <button
             
              type="button"
              disabled={props.busy}
              onClick={() => props.onRemove(term.id)} class="action action-danger-outline"
            >
              <Trash class="size-4" aria-hidden="true" />
              {t('taxonomytags.remove')}
            </button>
          </li>
        )}
      </For>
    </TaxonomyToolPanel>
  );
}
