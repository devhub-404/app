import { RefreshCw } from 'lucide-solid';
import type { JSX } from 'solid-js';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import ListPanelActionHeader from '@/shared/ui/components/surfaces/list-panel-action-header.component.tsx';
import PanelHeading from '@/shared/ui/components/surfaces/panel-heading.component.tsx';

type Props = {
  title: string;
  description: string;
  refreshLabel: string;
  loading: boolean;
  onRefresh: () => void;
  children: JSX.Element;
};

export default function SuggestionPanel(props: Props) {
  return (
    <ListPanel>
      <ListPanelActionHeader>
        <PanelHeading title={props.title} description={props.description} />
        <button type="button" onClick={props.onRefresh} disabled={props.loading} class="action action-secondary">
          <RefreshCw class="size-4" aria-hidden="true" />
          {props.refreshLabel}
        </button>
      </ListPanelActionHeader>
      {props.children}
    </ListPanel>
  );
}
