import { splitProps, type JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingVariant =
  | 'page'
  | 'pageCompact'
  | 'marketing'
  | 'hero'
  | 'article'
  | 'detail'
  | 'formPage'
  | 'strongPage'
  | 'visuallyHidden'
  | 'largeSection'
  | 'largeSectionCompact'
  | 'tiny'
  | 'tinyAccent'
  | 'microAccent'
  | 'denseCard'
  | 'denseCardInline'
  | 'featureCard'
  | 'strongSection'
  | 'danger'
  | 'section'
  | 'subsection'
  | 'card'
  | 'callout'
  | 'compact';

type Props = Omit<JSX.HTMLAttributes<HTMLHeadingElement>, 'class' | 'classList' | 'children'> & {
  children: JSX.Element;
  level: HeadingLevel;
  variant?: HeadingVariant;
  class?: string;
};

const variants: Record<HeadingVariant, string> = {
  page: 'text-balance text-3xl font-semibold tracking-tight text-content sm:text-4xl',
  pageCompact: 'text-balance text-2xl font-semibold tracking-tight text-content sm:text-3xl',
  marketing: 'text-4xl font-semibold leading-tight text-content sm:text-5xl',
  hero: 'text-5xl font-semibold leading-[1.02] tracking-tight text-content sm:text-7xl',
  article: 'text-3xl font-semibold tracking-tight text-content sm:text-5xl',
  detail: 'text-4xl font-semibold text-content',
  formPage: 'text-2xl font-semibold tracking-tight text-content',
  strongPage: 'text-3xl font-bold text-content',
  visuallyHidden: 'sr-only',
  largeSection: 'text-3xl font-semibold tracking-tight text-content sm:text-4xl',
  largeSectionCompact: 'text-2xl font-semibold tracking-tight text-content sm:text-3xl',
  tiny: 'text-xs font-semibold uppercase tracking-[.16em] text-content-muted',
  tinyAccent: 'text-xs font-semibold uppercase tracking-[.16em] text-content-accent',
  microAccent: 'text-[10px] font-semibold uppercase tracking-[.16em] text-content-accent',
  denseCard: 'text-[.9rem] font-bold',
  denseCardInline: 'text-[.95rem] font-bold',
  featureCard: 'text-[1.35rem] font-bold max-[700px]:text-[1.1rem]',
  strongSection: 'text-2xl font-bold text-content',
  danger: 'text-sm font-semibold text-danger',
  section: 'text-2xl font-semibold tracking-tight text-content',
  subsection: 'text-xl font-semibold text-content',
  card: 'text-lg font-semibold leading-tight text-content',
  callout: 'text-base font-semibold text-content',
  compact: 'text-sm font-semibold text-content',
};

export default function Heading(props: Props) {
  const [local, headingProps] = splitProps(props, ['children', 'level', 'variant', 'class']);
  const tag = `h${local.level}` as const;

  return (
    <Dynamic
      component={tag}
      {...headingProps}
      class={`${variants[local.variant ?? 'section']} ${local.class ?? ''}`.trim()}
    >
      {local.children}
    </Dynamic>
  );
}
