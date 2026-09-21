import { Field as ArkField } from '@ark-ui/solid';
import type { JSX } from 'solid-js';

type Props = {
  children: JSX.Element;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  class?: string;
};

export default function Field(props: Props) {
  return (
    <ArkField.Root
      id={props.id}
      required={props.required}
      disabled={props.disabled}
      invalid={props.invalid}
      readOnly={props.readOnly}
      class={`grid gap-2 ${props.class ?? ''}`.trim()}
    >
      {props.children}
    </ArkField.Root>
  );
}
