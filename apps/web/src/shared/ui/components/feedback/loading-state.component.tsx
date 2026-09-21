import { splitProps, type JSX } from 'solid-js';

type Props = Omit<JSX.HTMLAttributes<HTMLParagraphElement>, 'class' | 'classList'>;

export default function LoadingState(props: Props) {
  const [local, paragraphProps] = splitProps(props, ['children']);
  return (
    <p {...paragraphProps} role="status" class="text-muted px-6 py-8">
      {local.children}
    </p>
  );
}
