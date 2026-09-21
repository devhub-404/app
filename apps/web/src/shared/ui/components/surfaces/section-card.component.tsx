import { splitProps, type JSX } from 'solid-js';
import Surface from '@/shared/ui/components/surfaces/surface.component.tsx';

type CardProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'classList'>;

export default function SectionCard(props: CardProps) {
  const [local, sectionProps] = splitProps(props, ['children']);
  return (
    <Surface {...sectionProps} variant="elevated" padding="lg" class="grid gap-5 rounded-3xl">
      {local.children}
    </Surface>
  );
}

export function SectionCardHeading(props: { title: JSX.Element; description: JSX.Element }) {
  return (
    <header class="flex flex-col gap-1">
      <h2 class="heading-card">
        {props.title}
      </h2>
      <p class="text-muted">{props.description}</p>
    </header>
  );
}

export function SectionCardBody(props: { children: JSX.Element }) {
  return <div class="grid gap-4">{props.children}</div>;
}
