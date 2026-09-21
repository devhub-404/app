import { For } from 'solid-js';
import type { PanelRole } from '@/features/panel/access/panel.access.ts';
import { Tabs } from '@ark-ui/solid/tabs';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/panel/i18n';
import { useTaxonomyTags } from '@/features/panel/ui/hooks/use-taxonomy-tags.hook.ts';
import TaxonomyHeader from './taxonomy/taxonomy-header.component.tsx';
import CanonicalTagsPanel from './taxonomy/canonical-tags-panel.component.tsx';
import CreateTagPanel from './taxonomy/create-tag-panel.component.tsx';
import TagAliasesPanel from './taxonomy/tag-aliases-panel.component.tsx';
import TagMergePanel from './taxonomy/tag-merge-panel.component.tsx';
import ProtectedTermsPanel from './taxonomy/protected-terms-panel.component.tsx';

type Props = {
  role: PanelRole | null;
};

function TagTaxonomy(props: Props) {
  const { t, locale } = useI18n();
  const taxonomy = useTaxonomyTags(props.role);
  const tabs: Array<readonly [string, string]> = [];
  if (taxonomy.canManageTags) tabs.push(['tags', t('taxonomytags.tagsCanonical')]);
  if (taxonomy.canManageAliases) tabs.push(['aliases', t('taxonomytags.aliases')]);
  if (taxonomy.canManageTags) tabs.push(['merge', t('taxonomytags.merge')]);
  if (taxonomy.canManageGovernance) tabs.push(['terms', t('taxonomytags.protection')]);

  return (
    <div class="space-y-6">
      <TaxonomyHeader
        query={taxonomy.query()}
        message={taxonomy.message()}
        busy={taxonomy.busy()}
        onQueryChange={taxonomy.setQuery}
        onReload={() => void taxonomy.reload()}
      />
      <Tabs.Root defaultValue="tags">
        <Tabs.List
          aria-label={t('taxonomytags.toolsTaxonomy')}
          class="flex w-full gap-1 overflow-x-auto rounded-2xl border border-line bg-surface-elevated p-1"
        >
          <For each={tabs}>
            {([value, label]) => (
              <Tabs.Trigger
                value={value}
                class="shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-content-muted transition duration-standard ease-standard hover:bg-surface-subtle hover:text-content data-[state=active]:bg-action data-[state=active]:text-content-on-accent"
              >
                {label}
              </Tabs.Trigger>
            )}
          </For>
        </Tabs.List>
        {taxonomy.canManageTags && (
          <Tabs.Content value="tags" class="space-y-5 pt-5">
            <CreateTagPanel busy={taxonomy.busy()} onCreate={taxonomy.createTag} />
            <CanonicalTagsPanel
              items={taxonomy.items()}
              loading={taxonomy.loading()}
              busy={taxonomy.busy()}
              onUpdate={taxonomy.updateTag}
              onDelete={taxonomy.deleteTag}
              page={taxonomy.page()}
              pageSize={taxonomy.pageSize}
              total={taxonomy.total()}
              onPageChange={taxonomy.setPage}
            />
          </Tabs.Content>
        )}
        {taxonomy.canManageAliases && (
          <Tabs.Content value="aliases" class="pt-5">
            <TagAliasesPanel
              tags={taxonomy.items()}
              aliases={taxonomy.aliases()}
              busy={taxonomy.busy()}
              locale={locale()}
              onAdd={taxonomy.addAlias}
              onRemove={(id) => void taxonomy.removeAlias(id)}
            />
          </Tabs.Content>
        )}
        {taxonomy.canManageTags && (
          <Tabs.Content value="merge" class="pt-5">
            <TagMergePanel
              tags={taxonomy.items()}
              busy={taxonomy.busy()}
              locale={locale()}
              onConfirm={taxonomy.mergeTags}
            />
          </Tabs.Content>
        )}
        {taxonomy.canManageGovernance && (
          <Tabs.Content value="terms" class="pt-5">
            <ProtectedTermsPanel
              terms={taxonomy.terms()}
              busy={taxonomy.busy()}
              locale={locale()}
              onAdd={taxonomy.addProtectedTerm}
              onRemove={(id) => void taxonomy.removeProtectedTerm(id)}
            />
          </Tabs.Content>
        )}
      </Tabs.Root>
    </div>
  );
}

export default withLocale(TagTaxonomy);
