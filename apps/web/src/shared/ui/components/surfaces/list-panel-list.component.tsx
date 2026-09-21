import type { JSX } from 'solid-js';

export default function ListPanelList(props: { children: JSX.Element }) {
  return <ul class="divide-y divide-separator">{props.children}</ul>;
}
