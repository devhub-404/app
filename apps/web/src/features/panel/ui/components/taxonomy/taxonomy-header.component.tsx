import { RefreshCw } from 'lucide-solid';
import { Show } from 'solid-js';
import SearchField from '@/shared/ui/components/forms/search-field.component.tsx';
import { useI18n } from '@/features/panel/i18n';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import ListPanelHeader from '@/shared/ui/components/surfaces/list-panel-header.component.tsx';
import PanelHeading from '@/shared/ui/components/surfaces/panel-heading.component.tsx';

export default function TaxonomyHeader(props: {
  query: string;
  message: string;
  busy: boolean;
  onQueryChange: (value: string) => void;
  onReload: () => void;
}) {
  const { t } = useI18n();
  return (
    <ListPanel>
      <ListPanelHeader>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <PanelHeading
            title={t('taxonomytags.vocabularyCanonical')}
            description={t('taxonomytags.searchMaintainTagsOrganizeContentPlatform')}
          />
          <div class="flex w-full gap-2 sm:w-auto">
            <SearchField
              value={props.query}
              onChange={props.onQueryChange}
              label={t('taxonomytags.searchNameOrSlug')}
              placeholder={t('taxonomytags.searchNameOrSlug')}
            />
            <button type="button" disabled={props.busy} onClick={props.onReload} class="action action-secondary">
              <RefreshCw class="size-4" aria-hidden="true" />
              {t('newssuggestionsadminlist.update')}
            </button>
          </div>
        </div>
      </ListPanelHeader>
      <Show when={props.message}>
        <p role="status" class="text-muted border-b border-line px-5 py-3 sm:px-6">
          {props.message}
        </p>
      </Show>
    </ListPanel>
  );
}
