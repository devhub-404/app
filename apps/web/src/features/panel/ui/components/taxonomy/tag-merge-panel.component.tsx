import { Check, GitMerge, X } from 'lucide-solid';
import { Show, createSignal } from 'solid-js';
import { createForm, setValue } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import type { TagDTO } from '@/shared/taxonomy/public';
import { useI18n } from '@/features/panel/i18n';
import { createTaxonomySchemas, type MergeTagsFormInput } from '@/features/panel/ui/schemas/forms.schema.ts';
import TagSelector from '@/shared/ui/components/forms/tag-selector.component.tsx';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import ListPanelHeader from '@/shared/ui/components/surfaces/list-panel-header.component.tsx';
import PanelHeading from '@/shared/ui/components/surfaces/panel-heading.component.tsx';
import Alert from '@/shared/ui/components/feedback/alert.component.tsx';

export default function TagMergePanel(props: {
  tags: TagDTO[];
  busy: boolean;
  locale: 'pt' | 'en' | 'es';
  onConfirm: (sourceTagId: string, targetTagId: string) => Promise<boolean>;
}) {
  const { t } = useI18n();
  const schema = createTaxonomySchemas(props.locale).merge;
  const [_form, { Form, Field: FormField }] = createForm<MergeTagsFormInput>({
    validate: zodForm(schema),
    validateOn: 'submit',
    revalidateOn: 'input',
    initialValues: { sourceTagId: '', targetTagId: '' },
  });
  const [pending, setPending] = createSignal<MergeTagsFormInput | null>(null);
  const tagName = (id: string) => props.tags.find((tag) => tag.id === id)?.slug ?? id;
  const review = (value: MergeTagsFormInput) => {
    setPending(value);
  };

  return (
    <ListPanel>
      <ListPanelHeader>
        <PanelHeading
          title={t('taxonomytags.mergeTags')}
          description={t('taxonomytags.sourceWillBeAbsorbedByTagDestination')}
        />
      </ListPanelHeader>
      <div class="p-5 sm:p-6">
        <Form onSubmit={review} class="grid gap-4 sm:grid-cols-2 sm:items-end">
          <FormField name="sourceTagId">
            {(field) => (
              <TagSelector
                id="taxonomy-source-tag"
                label={t('taxonomytags.source')}
                value={field.value ? [field.value] : []}
                initialOptions={props.tags}
                remote={false}
                valueKey="id"
                max={1}
                onChange={(value) => setValue(_form, 'sourceTagId', value[0] ?? '')}
              />
            )}
          </FormField>
          <FormField name="targetTagId">
            {(field) => (
              <TagSelector
                id="taxonomy-target-tag"
                label={t('taxonomytags.destination')}
                value={field.value ? [field.value] : []}
                initialOptions={props.tags}
                remote={false}
                valueKey="id"
                max={1}
                onChange={(value) => setValue(_form, 'targetTagId', value[0] ?? '')}
              />
            )}
          </FormField>
          <Show
            when={pending()}
            fallback={
              <button type="submit" disabled={props.busy} class="action action-secondary">
                <GitMerge class="size-4" aria-hidden="true" />
                {t('taxonomytags.reviewMerge')}
              </button>
            }
          >
            <Alert status="warning">
              <p class="text-muted">
                {t('taxonomytags.merge')} <strong>{tagName(pending()!.sourceTagId)}</strong> {t('taxonomytags.in')}{' '}
                <strong>{tagName(pending()!.targetTagId)}</strong>?
              </p>
              <div class="mt-3 flex flex-wrap gap-2">
                <button
                 
                  type="button"
                  disabled={props.busy}
                  onClick={async () => {
                    if (await props.onConfirm(pending()!.sourceTagId, pending()!.targetTagId)) setPending(null);
                  }} class="action action-primary"
                >
                  <Check class="size-4" aria-hidden="true" />
                  {t('taxonomytags.confirm')}
                </button>
                <button type="button" onClick={() => setPending(null)} class="action action-secondary">
                  <X class="size-4" aria-hidden="true" />
                  {t('resourceadmindetail.cancel')}
                </button>
              </div>
            </Alert>
          </Show>
        </Form>
      </div>
    </ListPanel>
  );
}
