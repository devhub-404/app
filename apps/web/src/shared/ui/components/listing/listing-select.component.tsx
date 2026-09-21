import Select from '@/shared/ui/components/forms/select.component.tsx';
import type { Component } from 'solid-js';

export type ListingSelectOption = { value: string; label: string };
type Props = {
  id: string;
  value: string;
  options: ListingSelectOption[];
  onChange: (value: string) => void;
  icon: Component<{ class?: string }>;
  ariaLabel: string;
};

function ListingSelect(props: Props) {
  return (
    <Select
      id={props.id}
      value={props.value}
      options={props.options}
      onChange={props.onChange}
      ariaLabel={props.ariaLabel}
      icon={props.icon}
      class="min-w-0 shrink-0 lg:w-40 xl:w-44"
      triggerClass="relative flex h-10 w-full items-center rounded-xl border border-line bg-surface pl-9 pr-9 text-left text-sm text-content outline-none transition duration-standard ease-standard hover:border-action-border focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    />
  );
}

export default ListingSelect;
