import { Plus, Trash } from 'lucide-solid';
import { createForm, reset, setValue } from '@modular-forms/solid';
import { For } from 'solid-js';
import { zodForm } from '@/shared/ui/forms/zod-form';
import type { TagAliasDTO, TagDTO } from '@/shared/taxonomy/public';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import TagSelector from '@/shared/ui/components/forms/tag-selector.component.tsx';
import { useI18n } from '@/features/panel/i18n';
import TaxonomyToolPanel from './taxonomy-tool-panel.component.tsx';
import { createTaxonomySchemas, type TagAliasFormInput } from '@/features/panel/ui/schemas/forms.schema.ts';

export default function TagAliasesPanel(props: {
  tags: TagDTO[];
  aliases: TagAliasDTO[];
  busy: boolean;
  locale: 'pt' | 'en' | 'es';
  onAdd: (tagId: string, alias: string) => Promise<boolean>;
  onRemove: (id: string) => void;
}) {
  const { t } = useI18n();
  const tagName = (id: string) => props.tags.find((tag) => tag.id === id)?.slug ?? id;
  const schema = createTaxonomySchemas(props.locale).alias;
  const [_form, { Form, Field: FormField }] = createForm<TagAliasFormInput>({
    validate: zodForm(schema),
    validateOn: 'submit',
    revalidateOn: 'input',
    initialValues: { tagId: '', alias: '' },
  });
  const add = async (value: TagAliasFormInput) => {
    if (await props.onAdd(value.tagId, value.alias.trim())) {
      reset(_form);
    }
  };

  return (
    <TaxonomyToolPanel
      title={t('taxonomytags.aliases')}
      description={t('taxonomytags.variationsPointToTagCanonical')}
      form={
        <Form onSubmit={add} class="grid gap-4 sm:grid-cols-2 sm:items-end">
          <FormField name="tagId">
            {(field) => (
              <TagSelector
                id="taxonomy-alias-tag"
                label={t('taxonomytags.tagCanonical')}
                value={field.value ? [field.value] : []}
                initialOptions={props.tags}
                remote={false}
                valueKey="id"
                max={1}
                onChange={(value) => setValue(_form, 'tagId', value[0] ?? '')}
              />
            )}
          </FormField>
          <Field>
            <label for="taxonomy-alias-value" class="field-label">{t('taxonomytags.alias')}</label>
            <FormField name="alias">{(_, fieldProps) => <input {...fieldProps} id="taxonomy-alias-value"  class="field-control"/>}</FormField>
          </Field>
          <button type="submit" disabled={props.busy} class="action action-primary">
            <Plus class="size-4" aria-hidden="true" />
            {t('taxonomytags.addAlias')}
          </button>
        </Form>
      }
    >
      <For
        each={props.aliases}
        fallback={<li class="px-4 py-3 text-sm text-content-muted">{t('taxonomytags.noliasRegistered')}</li>}
      >
        {(alias) => (
          <li class="flex items-center justify-between gap-2 px-4 py-3 text-sm">
            <span class="min-w-0 truncate">
              <strong>{alias.alias}</strong> → {tagName(alias.tagId)}
            </span>
            <button
             
              type="button"
              disabled={props.busy}
              onClick={() => props.onRemove(alias.id)} class="action action-danger-outline"
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
