import { splitProps, type JSX } from 'solid-js';

type Props = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'classList'>;

export default function EmptyState(props: Props) {
  const [local, divProps] = splitProps(props, ['children']);
  return (
    <div {...divProps} class="px-6 py-12 text-center">
      {local.children}
    </div>
  );
}
