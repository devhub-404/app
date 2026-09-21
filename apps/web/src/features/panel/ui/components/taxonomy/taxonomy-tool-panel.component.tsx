import type { JSX } from 'solid-js';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import ListPanelHeader from '@/shared/ui/components/surfaces/list-panel-header.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';
import PanelHeading from '@/shared/ui/components/surfaces/panel-heading.component.tsx';

interface Props {
  title: string;
  description: string;
  form: JSX.Element;
  children: JSX.Element;
}

export default function TaxonomyToolPanel(props: Props) {
  return (
    <ListPanel>
      <ListPanelHeader>
        <PanelHeading title={props.title} description={props.description} />
      </ListPanelHeader>
      <div class="grid gap-4 p-5 sm:p-6">{props.form}</div>
      <ListPanelList>{props.children}</ListPanelList>
    </ListPanel>
  );
}
