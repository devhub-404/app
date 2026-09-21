import { splitProps, type JSX } from 'solid-js';

type TextVariant =
  | 'body'
  | 'lead'
  | 'intro'
  | 'muted'
  | 'subtle'
  | 'caption'
  | 'eyebrow'
  | 'fieldHeading'
  | 'accentLabel'
  | 'warningLabel'
  | 'mutedBody'
  | 'mutedCompact'
  | 'strong'
  | 'emphasis'
  | 'accent'
  | 'success'
  | 'successCaption'
  | 'danger'
  | 'dangerCaption'
  | 'microAccent'
  | 'status'
  | 'featuredLabel'
  | 'featuredDescription';

type Props = Omit<JSX.HTMLAttributes<HTMLParagraphElement>, 'class' | 'classList' | 'children'> & {
  children: JSX.Element;
  variant?: TextVariant;
  class?: string;
};

const variants: Record<TextVariant, string> = {
  body: 'text-base leading-6 text-content',
  lead: 'text-sm leading-6 text-content-muted sm:text-[15px]',
  intro: 'text-base leading-7 text-content-muted',
  muted: 'text-sm text-content-muted',
  subtle: 'text-sm text-content-subtle',
  caption: 'text-xs text-content-muted',
  eyebrow: 'text-[11px] font-semibold uppercase tracking-[.18em] text-content-subtle',
  fieldHeading: 'text-xs font-semibold uppercase tracking-[.14em] text-content-muted',
  accentLabel: 'text-xs font-semibold uppercase tracking-[.16em] text-content-accent',
  warningLabel: 'text-xs font-semibold uppercase tracking-[.16em] text-warning',
  mutedBody: 'text-sm leading-6 text-content-muted',
  mutedCompact: 'text-sm leading-5 text-content-muted',
  strong: 'text-sm font-semibold text-content',
  emphasis: 'text-base font-semibold text-content',
  accent: 'text-sm text-content-accent',
  success: 'text-sm text-success',
  successCaption: 'text-xs text-success',
  danger: 'text-sm text-danger',
  dangerCaption: 'text-xs text-danger',
  microAccent: 'text-[10px] font-semibold uppercase tracking-[.16em] text-content-accent',
  status: 'text-sm',
  featuredLabel: 'text-[.7rem]! text-content-accent',
  featuredDescription: 'text-sm text-content-muted max-[700px]:text-[.76rem]',
};

export default function Text(props: Props) {
  const [local, textProps] = splitProps(props, ['children', 'variant', 'class']);

  return (
    <p {...textProps} class={`${variants[local.variant ?? 'body']} ${local.class ?? ''}`.trim()}>
      {local.children}
    </p>
  );
}
