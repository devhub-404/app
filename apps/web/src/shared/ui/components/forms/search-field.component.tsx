import { Search } from 'lucide-solid';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
};

export default function SearchField(props: Props) {
  return (
    <label class="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-xl border border-line bg-surface px-4 transition duration-standard ease-standard focus-within:border-action-border focus-within:ring-2 focus-within:ring-focus">
      <Search class="size-4 shrink-0 text-content-muted" aria-hidden="true" />
      <span class="sr-only">{props.label}</span>
      <input
        type="search"
        aria-label={props.label}
        value={props.value}
        onInput={(event) => props.onChange(event.currentTarget.value)}
        placeholder={props.placeholder}
        class="field-control border-0 bg-transparent px-0 py-0 text-sm focus:border-0 focus:ring-0 placeholder:text-xs"
      />
    </label>
  );
}
