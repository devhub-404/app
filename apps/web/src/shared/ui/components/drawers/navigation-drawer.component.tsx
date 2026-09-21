import type { JSX } from 'solid-js';
import { For } from 'solid-js';
import Drawer from './drawer.component.tsx';
import { useI18n } from '@/shared/i18n';

export type NavigationDrawerItem = {
  label: string;
  href: string;
  icon?: JSX.Element;
  tone?: 'default' | 'danger';
};

export type NavigationDrawerGroup = {
  label?: string;
  items: NavigationDrawerItem[];
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  title: JSX.Element;
  groups: NavigationDrawerGroup[];
  activeHref?: string;
  trigger: (props: JSX.HTMLAttributes<HTMLButtonElement>) => JSX.Element;
}

/** Mobile navigation composition. The drawer lifecycle remains owned by Ark. */
export default function NavigationDrawer(props: Props) {
  const { t } = useI18n();
  return (
    <Drawer
      open={props.open}
      onOpenChange={props.onOpenChange}
      titleId={props.titleId}
      title={props.title}
      description={t('navigationdrawer.mainNavigation')}
      trigger={props.trigger}
    >
      <nav aria-label={t('navigationdrawer.mainNavigation')} class="grid gap-1">
        <For each={props.groups}>
          {(group) => (
            <div class="grid gap-1">
              {group.label && (
                <p class="px-4 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-content-muted">
                  {group.label}
                </p>
              )}
              <For each={group.items}>
                {(item) => (
                  <a
                    href={item.href}
                    onClick={() => props.onOpenChange(false)}
                    aria-current={props.activeHref === item.href ? 'page' : undefined}
                    class={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-surface-subtle aria-[current=page]:bg-action aria-[current=page]:text-content-on-accent ${item.tone === 'danger' ? 'text-danger hover:bg-danger-bg' : 'text-content'}`.trim()}
                  >
                    {item.icon && (
                      <span class="shrink-0" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    <span>{item.label}</span>
                  </a>
                )}
              </For>
            </div>
          )}
        </For>
      </nav>
    </Drawer>
  );
}
