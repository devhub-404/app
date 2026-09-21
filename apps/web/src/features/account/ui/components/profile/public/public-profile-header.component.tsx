import { For, Show } from 'solid-js';
import type { PublicProfileDTO } from '@/features/account/types/profile.type.ts';
import { routes } from '@/shared/navigation/routes';
import { useI18n } from '@/features/account/i18n';
import type { ProfileTab } from './profile-contributions.component.ts';
import UserAvatar from '../../user-avatar.component.tsx';
import { AtSign, ExternalLink, GitBranch, Globe, MapPin, Newspaper, Pencil } from 'lucide-solid';
type Filter = { id: ProfileTab; labelKey: Parameters<ReturnType<typeof useI18n>['t']>[0]; count: number };

export default function PublicProfileHeader(props: {
  profile: PublicProfileDTO;
  canEdit: boolean;
  filters: Filter[];
  onSelectTab: (tab: ProfileTab) => void;
}) {
  const { t } = useI18n();
  const links = () =>
    [
      { label: t('profile.link.website'), href: props.profile.portfolioUrl?.trim(), icon: Globe },
      { label: t('profile.link.github'), href: props.profile.githubUrl?.trim(), icon: GitBranch },
      { label: t('profile.link.linkedin'), href: props.profile.linkedinUrl?.trim(), icon: AtSign },
      { label: t('profile.link.x'), href: props.profile.twitterUrl?.trim(), icon: Newspaper },
    ].filter((link): link is { label: string; href: string; icon: typeof Globe } => Boolean(link.href));

  return (
    <header class="rounded-3xl border border-line bg-surface-elevated p-6 shadow-sm sm:p-8">
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex min-w-0 items-start gap-3">
            <UserAvatar
              src={props.profile.avatarUrl}
              name={props.profile.displayName ?? props.profile.username}
              alt=""
              class="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-action-muted text-sm font-extrabold text-content"
            />
            <div class="min-w-0">
              <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h1 class="heading-page-compact">
                  {props.profile.displayName ?? props.profile.username}
                </h1>
                <span class="text-sm text-content-muted">@{props.profile.username}</span>
              </div>
              <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-content-muted">
                <Show when={props.profile.headline}>
                  <span>{props.profile.headline}</span>
                </Show>
                <Show when={props.profile.location}>
                  <span class="inline-flex items-center gap-1">
                    <MapPin class="size-3.5" />
                    {props.profile.location}
                  </span>
                </Show>
              </div>
            </div>
          </div>
          <Show when={props.canEdit}>
            <a href={routes.account.profile} class="action action-secondary">
              <Pencil class="size-4" /> {t('publicprofile.editProfile')}
            </a>
          </Show>
        </div>
        <Show when={props.profile.bio?.trim()}>
          <p class="text-muted-body max-w-3xl whitespace-pre-wrap sm:pl-[4.25rem]">
            {props.profile.bio}
          </p>
        </Show>
        <Show when={links().length}>
          <div class="flex flex-wrap gap-2 sm:pl-[4.25rem]">
            <For each={links()}>
              {(link) => {
                const Icon = link.icon;
                return (
                  <a href={link.href} target="_blank" rel="noreferrer" class="action action-secondary">
                    <Icon class="size-3.5" />
                    {link.label}
                    <ExternalLink class="size-3" />
                  </a>
                );
              }}
            </For>
          </div>
        </Show>
      </div>
      <Show when={props.filters.length}>
        <div class="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
          <For each={props.filters}>
            {(filter) => (
              <button type="button" onClick={() => props.onSelectTab(filter.id)} class="action action-ghost">
                <p class="text-strong">{filter.count}</p>
                <p class="text-caption mt-0.5">
                  {t(filter.labelKey)}
                </p>
              </button>
            )}
          </For>
        </div>
      </Show>
    </header>
  );
}
