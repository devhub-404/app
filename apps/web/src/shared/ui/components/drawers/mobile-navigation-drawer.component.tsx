import {
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileText,
  House,
  Inbox,
  Library,
  Map,
  Menu as MenuIcon,
  MessageCircle,
  MessagesSquare,
  Newspaper,
  Wrench,
  X,
} from 'lucide-solid';
import { createSignal, For, onCleanup, onMount, Show } from 'solid-js';
import Drawer from './drawer.component.tsx';

type IconName =
  | 'home'
  | 'inbox'
  | 'file-text'
  | 'book-open'
  | 'clipboard-list'
  | 'map'
  | 'messages-square'
  | 'library'
  | 'wrench'
  | 'boxes'
  | 'calendar-days'
  | 'briefcase-business'
  | 'newspaper'
  | 'message-circle';

export type MobileNavigationGroup = {
  label: string;
  items: { label: string; href: string; icon: IconName }[];
};

interface Props {
  label: string;
  openLabel: string;
  title: string;
  titleId: string;
  groups: MobileNavigationGroup[];
  activeHref?: string;
}

const icons = {
  home: House,
  inbox: Inbox,
  'file-text': FileText,
  'book-open': BookOpen,
  'clipboard-list': ClipboardList,
  map: Map,
  'messages-square': MessagesSquare,
  library: Library,
  wrench: Wrench,
  boxes: Boxes,
  'calendar-days': CalendarDays,
  'briefcase-business': BriefcaseBusiness,
  newspaper: Newspaper,
  'message-circle': MessageCircle,
} as const;

export default function MobileNavigationDrawer(props: Props) {
  const [open, setOpen] = createSignal(false);
  const [activeHref, setActiveHref] = createSignal(props.activeHref ?? '');

  onMount(() => {
    const syncActiveHref = () => setActiveHref(window.location.pathname);
    document.addEventListener('astro:page-load', syncActiveHref);
    syncActiveHref();
    onCleanup(() => document.removeEventListener('astro:page-load', syncActiveHref));
  });

  const isActive = (href: string) => {
    const pathname = activeHref();
    return href === '/' ? pathname === '/' : pathname.startsWith(href);
  };

  return (
    <Drawer
      open={open()}
      onOpenChange={setOpen}
      titleId={props.titleId}
      title={props.title}
      trigger={(triggerProps) => (
        <button
          {...triggerProps}
          type="button"
          aria-label={props.openLabel}
          class="group flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 font-semibold text-content-muted hover:bg-hover hover:text-content"
        >
          <Show when={open()} fallback={<MenuIcon class="size-[19px]" aria-hidden="true" />}>
            <X class="size-[19px]" aria-hidden="true" />
          </Show>
          <span class="text-[0.68rem]">{props.label}</span>
        </button>
      )}
    >
      <nav aria-label={props.title} class="grid gap-4">
        <For each={props.groups}>
          {(group) => (
            <section class="grid gap-1" aria-labelledby={`${props.titleId}-${group.label}`}>
              <h3
                id={`${props.titleId}-${group.label}`}
                class="px-4 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-content-muted"
              >
                {group.label}
              </h3>
              <For each={group.items}>
                {(item) => {
                  const Icon = icons[item.icon];
                  const active = () => isActive(item.href);
                  return (
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active() ? 'page' : undefined}
                      class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-content transition hover:bg-surface-subtle aria-[current=page]:bg-action aria-[current=page]:text-content-on-accent"
                    >
                      <Icon class="size-4 shrink-0" aria-hidden="true" />
                      <span class="min-w-0 flex-1 truncate">{item.label}</span>
                      <ChevronRight class="size-4 shrink-0 opacity-50" aria-hidden="true" />
                    </a>
                  );
                }}
              </For>
            </section>
          )}
        </For>
      </nav>
    </Drawer>
  );
}
