import { Collapsible } from '@ark-ui/solid/collapsible';
import { ChevronDown } from 'lucide-solid';
import { For } from 'solid-js';

interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

interface AccountSidebarProps {
  label: string;
  activeGroup: string;
  groups: NavGroup[];
}

export default function AccountSidebar(props: AccountSidebarProps) {
  return (
    <nav
      aria-label={props.label}
      class="min-w-0 rounded-2xl border border-line bg-surface-subtle p-2.5 md:max-h-[calc(100vh-3rem)] md:overflow-y-auto md:p-3"
    >
      <div class="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
        <For each={props.groups}>
          {(group) => (
            <Collapsible.Root defaultOpen={group.label === props.activeGroup} class="group shrink-0">
              <Collapsible.Trigger class="flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-xs font-medium text-content-muted outline-none transition duration-standard ease-standard hover:bg-hover hover:text-content focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-subtle">
                <span>{group.label}</span>
                <ChevronDown
                  aria-hidden="true"
                  class="size-4 text-content-subtle transition-transform duration-standard ease-standard group-data-[state=open]:rotate-180"
                />
              </Collapsible.Trigger>
              <Collapsible.Content class="flex flex-col gap-1 pt-1">
                <For each={group.items}>
                  {(item) => (
                    <a
                      href={item.href}
                      aria-current={item.active ? 'page' : undefined}
                      class={`relative rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap outline-none transition duration-standard ease-standard focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-subtle ${
                        item.active
                          ? 'bg-selected text-content before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-action'
                          : 'text-content-muted hover:bg-hover hover:text-content'
                      }`}
                    >
                      {item.label}
                    </a>
                  )}
                </For>
              </Collapsible.Content>
            </Collapsible.Root>
          )}
        </For>
      </div>
    </nav>
  );
}
