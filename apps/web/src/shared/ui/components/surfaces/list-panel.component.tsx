import { splitProps, type JSX } from 'solid-js';
import Surface from './surface.component.tsx';

type Props = Omit<JSX.HTMLAttributes<HTMLElement>, 'classList'>;

export default function ListPanel(props: Props) {
  const [local, sectionProps] = splitProps(props, ['children']);
  return (
    <Surface {...sectionProps} variant="elevated" class="overflow-hidden rounded-3xl">
      {local.children}
    </Surface>
  );
}
