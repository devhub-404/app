import type { JSX } from 'solid-js';

interface Props {
  status: JSX.Element;
  meta?: JSX.Element;
  title: JSX.Element;
  description?: JSX.Element;
  actions: JSX.Element;
}

export default function ManagementListItem(props: Props) {
  return (
    <article class="px-5 py-5 sm:px-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="grid min-w-0 gap-3">
          <div class="flex flex-wrap items-center gap-2">
            {props.status}
            {props.meta}
          </div>
          <h2 class="heading-callout truncate text-base">
            {props.title}
          </h2>
          {props.description}
        </div>
        <div class="flex shrink-0 flex-wrap gap-2">{props.actions}</div>
      </div>
    </article>
  );
}
