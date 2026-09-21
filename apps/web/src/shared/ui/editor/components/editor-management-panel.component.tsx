import type { JSX } from 'solid-js';

interface Props {
  heading: string;
  children: JSX.Element;
}

export default function EditorManagementPanel(props: Props) {
  return (
    <section class="grid gap-5 rounded-2xl border border-line bg-surface-elevated p-4">
      <h2 class="heading-tiny text-xs">
        {props.heading}
      </h2>
      <div class="flex flex-col gap-3">{props.children}</div>
    </section>
  );
}
