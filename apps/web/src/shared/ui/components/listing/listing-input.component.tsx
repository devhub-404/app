import type { JSX } from 'solid-js';

type Props = {
  value: string | number;
  onInput: (value: string) => void;
  icon: JSX.Element;
  ariaLabel: string;
  placeholder?: string;
  inputMode?: 'text' | 'numeric' | 'decimal';
};

function ListingInput(props: Props) {
  return (
    <span class="relative block w-full min-w-0 shrink-0 lg:w-40 xl:w-44">
      <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" aria-hidden="true">
        {props.icon}
      </span>
      <input
        value={props.value}
        placeholder={props.placeholder}
        inputmode={props.inputMode}
        aria-label={props.ariaLabel}
        onInput={(event) => props.onInput(event.currentTarget.value)}
        class="field-control min-h-10 w-full rounded-lg border border-line bg-surface px-3 pl-9 text-sm text-content"
      />
    </span>
  );
}

export default ListingInput;
