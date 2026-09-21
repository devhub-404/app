import { Toggle } from '@ark-ui/solid';
import { splitProps, type JSX } from 'solid-js';

type ActionSize = 'sm' | 'md' | 'lg';

type Props = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'classList' | 'aria-pressed' | 'children'> & {
  pressed: boolean;
  size?: ActionSize;
  children?: JSX.Element;
};

export default function ToggleButton(props: Props) {
  const [local, buttonProps] = splitProps(props, ['children', 'pressed', 'size', 'class']);
  return (
    <Toggle.Root
      {...buttonProps}
      pressed={local.pressed}
      type={buttonProps.type ?? 'button'}
      class={`action action-secondary ${local.size === 'sm' ? 'action-compact' : ''} ${local.size === 'lg' ? 'action-large' : ''} aria-pressed:border-action-border aria-pressed:bg-action-muted aria-pressed:text-content-accent ${local.class ?? ''}`}
    >
      {local.children}
    </Toggle.Root>
  );
}
