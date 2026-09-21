import type { JSX } from 'solid-js';

type Props = {
  title: JSX.Element;
  description: JSX.Element;
  id?: string;
};

export default function PanelHeading(props: Props) {
  return (
    <div class="grid gap-1">
      <h2 id={props.id} class="heading-compact">
        {props.title}
      </h2>
      <p class="text-muted">{props.description}</p>
    </div>
  );
}
