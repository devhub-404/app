import type { JSX } from 'solid-js';

export default function ListPanelRows(props: { children: JSX.Element }) {
  return <div class="divide-y divide-separator">{props.children}</div>;
}
