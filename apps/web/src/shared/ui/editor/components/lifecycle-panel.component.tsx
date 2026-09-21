import type { JSX } from 'solid-js';

interface Props {
  headingId: string;
  eyebrow: string;
  heading: JSX.Element;
  badge: JSX.Element;
  description: JSX.Element;
  actions: JSX.Element;
  confirmation: JSX.Element;
}

export default function LifecyclePanel(props: Props) {
  return (
    <section class="grid gap-3 rounded-2xl border border-line bg-surface p-5" aria-labelledby={props.headingId}>
      <p class="text-eyebrow">{props.eyebrow}</p>
      <div class="flex flex-wrap items-center gap-2">
        <h2 id={props.headingId} class="heading-callout text-base">
          {props.heading}
        </h2>
        {props.badge}
      </div>
      <div class="text-sm text-content-muted">{props.description}</div>
      <div class="flex flex-wrap gap-2">{props.actions}</div>
      {props.confirmation}
    </section>
  );
}
