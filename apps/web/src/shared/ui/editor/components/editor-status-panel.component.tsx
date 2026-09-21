import type { JSX } from 'solid-js';

interface Props {
  heading: string;
  status: JSX.Element;
  metadata: JSX.Element;
  versionLabel: string;
  version: number;
  actions: JSX.Element;
}

export default function EditorStatusPanel(props: Props) {
  return (
    <section class="grid gap-4 rounded-2xl border border-line bg-surface-elevated p-4">
      <h2 class="heading-tiny text-xs">
        {props.heading}
      </h2>
      <div>{props.status}</div>
      <dl class="grid gap-3 text-sm">{props.metadata}</dl>
      <div class="flex justify-between text-sm">
        <span class="text-content-muted">{props.versionLabel}</span>
        <span class="font-medium text-content">{props.version}</span>
      </div>
      <div class="grid gap-2">{props.actions}</div>
    </section>
  );
}
