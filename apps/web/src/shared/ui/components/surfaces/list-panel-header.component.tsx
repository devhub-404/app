import type { JSX } from 'solid-js';

export default function ListPanelHeader(props: { children: JSX.Element }) {
  return <header class="border-b border-line px-5 py-5 sm:px-6">{props.children}</header>;
}
