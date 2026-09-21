import type { JSX } from 'solid-js';

export default function ListPanelActionHeader(props: { children: JSX.Element }) {
  return (
    <header class="flex flex-col gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      {props.children}
    </header>
  );
}
