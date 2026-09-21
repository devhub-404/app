import { splitProps, type JSX } from 'solid-js';

type SurfaceVariant = 'base' | 'elevated' | 'inset' | 'overlay';
type SurfacePadding = 'none' | 'sm' | 'md' | 'lg';

type Props = Omit<JSX.HTMLAttributes<HTMLElement>, 'classList'> & {
  variant?: SurfaceVariant;
  padding?: SurfacePadding;
};

const variants: Record<SurfaceVariant, string> = {
  base: 'bg-surface',
  elevated: 'bg-surface-elevated shadow-sm',
  inset: 'bg-surface-inset',
  overlay: 'bg-surface-overlay shadow-ui-overlay',
};

const paddings: Record<SurfacePadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export default function Surface(props: Props) {
  const [local, elementProps] = splitProps(props, ['children', 'class', 'variant', 'padding']);
  return (
    <section
      {...elementProps}
      class={`rounded-2xl border border-line ${variants[local.variant ?? 'base']} ${paddings[local.padding ?? 'none']} ${local.class ?? ''}`.trim()}
    >
      {local.children}
    </section>
  );
}
