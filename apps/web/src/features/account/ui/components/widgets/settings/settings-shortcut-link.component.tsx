import { splitProps, type JSX } from 'solid-js';

type Props = Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, 'class' | 'classList'>;

export default function SettingsShortcutLink(props: Props) {
  const [local, anchorProps] = splitProps(props, ['children']);
  return (
    <a
      {...anchorProps}
      class="rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-semibold text-content transition duration-standard ease-standard hover:border-action-border hover:bg-surface-subtle hover:text-content-accent"
    >
      {local.children}
    </a>
  );
}
