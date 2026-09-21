import { children, Show, type JSX } from 'solid-js';

type Props = {
  search: JSX.Element;
  children: JSX.Element;
  view?: JSX.Element;
  stackDesktop?: boolean;
};

function ListingToolbar(props: Props) {
  const resolvedChildren = children(() => props.children);
  const resolvedSearch = children(() => props.search);
  const resolvedView = children(() => props.view);

  return (
    <div class={`flex min-w-0 items-center gap-3 ${props.stackDesktop ? 'lg:grid lg:gap-3' : ''}`}>
      <div class={`min-w-0 flex-1 ${props.stackDesktop ? 'lg:flex-none' : ''}`}>{resolvedSearch()}</div>
      <div class={`contents ${props.stackDesktop ? 'lg:flex lg:min-w-0 lg:items-center lg:gap-3' : ''}`}>
        {resolvedChildren()}
        <Show when={resolvedView()}>
          <div class="ml-auto shrink-0">{resolvedView()}</div>
        </Show>
      </div>
    </div>
  );
}

export default ListingToolbar;
