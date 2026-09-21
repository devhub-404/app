import { Show, type JSX } from 'solid-js';
import ListPanel from './list-panel.component.tsx';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';

interface Props {
  headingId: string;
  title: string;
  description: string;
  action: JSX.Element;
  error: string;
  loading: boolean;
  loadingLabel: string;
  children: JSX.Element;
}

export default function ManagementListPanel(props: Props) {
  return (
    <ListPanel aria-labelledby={props.headingId}>
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-5 sm:px-6">
        <div class="grid min-w-0 gap-1">
          <p id={props.headingId} class="text-strong">
            {props.title}
          </p>
          <p class="text-muted">{props.description}</p>
        </div>
        <div class="shrink-0">{props.action}</div>
      </div>
      <Show when={props.error}>
        <div class="px-5 py-4 sm:px-6">
          <p role="status" class="text-danger rounded-2xl border border-danger-border bg-danger-bg p-3">
            {props.error}
          </p>
        </div>
      </Show>
      <Show when={!props.loading} fallback={<LoadingState role="status">{props.loadingLabel}</LoadingState>}>
        {props.children}
      </Show>
    </ListPanel>
  );
}
