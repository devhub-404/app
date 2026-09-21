import { For, Show } from 'solid-js';
import { withLocale } from '@/shared/i18n/core/solid';
import { routes } from '@/shared/navigation/routes';
import UserAvatar from './user-avatar.component.tsx';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import { useI18n } from '@/features/account/i18n';
import { useAccountOverview } from '@/features/account/ui/hooks/use-account-overview.hook.ts';
import { CircleCheck, CircleUserRound, FileText, MailCheck, MessageCircle, MonitorSmartphone, Send, ShieldCheck } from 'lucide-solid';
function AccountOverview() {
  const { t } = useI18n();
  const overview = useAccountOverview();

  const areas = [
    {
      label: t('accountoverview.profilePreferences'),
      detail: t('accountoverview.setHowYouAppearsHowDevhubWorksYou'),
      href: routes.account.profile,
      icon: <CircleUserRound class="size-4" aria-hidden="true" />,
    },
    {
      label: t('accountoverview.contentPublished'),
      detail: t('overview.publishedContentDescription'),
      href: routes.account.articles,
      icon: <FileText class="size-4" aria-hidden="true" />,
    },
    {
      label: t('accountoverview.suggestions'),
      detail: t('accountoverview.viewProposalsResourcesNewsEventsSubmittedCommunity'),
      href: routes.account.resourceSuggestions,
      icon: <Send class="size-4" aria-hidden="true" />,
    },
    {
      label: t('accountoverview.interactions'),
      detail: t('accountoverview.resumeNotificationsSavedVotesCommentsReports'),
      href: routes.account.notifications,
      icon: <MessageCircle class="size-4" aria-hidden="true" />,
    },
    {
      label: t('accountoverview.securityAccess'),
      detail: t('accountoverview.reviewAuthenticationSessionsEmailsMethodsRecovery'),
      href: routes.account.security,
      icon: <ShieldCheck class="size-4" aria-hidden="true" />,
    },
  ];

  return (
    <Show
      when={overview.details()}
      fallback={
        <ListPanel aria-busy="true">
          <div class="flex items-center gap-4 p-5 sm:p-6">
            <span class="size-14 animate-pulse rounded-2xl bg-surface-subtle" />
            <div class="min-w-0 flex-1 space-y-2">
              <span class="block h-4 w-28 animate-pulse rounded bg-surface-subtle" />
              <span class="block h-6 w-44 max-w-full animate-pulse rounded bg-surface-subtle" />
              <span class="block h-4 w-36 animate-pulse rounded bg-surface-subtle" />
            </div>
          </div>
          <p role="status" class="text-body sr-only">
            {t('accountoverview.loadingStatusAccount')}
          </p>
        </ListPanel>
      }
    >
      {(details) => {
        const name = () => details().profile.displayName || details().profile.username || t('accountoverview.account');
        const statuses = () => [
          {
            label: t('accountoverview.emailPrimary'),
            detail: overview.primaryEmailVerified()
              ? t('accountoverview.verifiedReadyRecovery')
              : t('accountoverview.confirmEmailRecoverAccessSecurity'),
            href: routes.account.emails,
            action: overview.primaryEmailVerified() ? t('accountoverview.manageEmails') : t('overview.verifyEmail'),
            ready: overview.primaryEmailVerified(),
            icon: <MailCheck class="size-4" aria-hidden="true" />,
          },
          {
            label: t('accountoverview.authenticationTwoFactors'),
            detail: overview.mfaEnabled()
              ? t('accountoverview.protectionAdditionalEnabled')
              : t('accountoverview.addSecondStepConfirmation'),
            href: routes.account.security,
            action: overview.mfaEnabled() ? t('accountoverview.manageSecurity') : t('overview.enableMfa'),
            ready: overview.mfaEnabled(),
            icon: <ShieldCheck class="size-4" aria-hidden="true" />,
          },
          {
            label: t('overview.activeSessions'),
            detail: overview.sessionsLoaded()
              ? overview.sessionCount() === 1
                ? t('overview.oneDeviceAccess')
                : t('overview.manyDevicesAccess', [overview.sessionCount()])
              : t('overview.checkingDevices'),
            href: routes.account.sessions,
            action: t('overview.reviewSessions'),
            ready: overview.sessionCount() <= 1,
            icon: <MonitorSmartphone class="size-4" aria-hidden="true" />,
          },
        ];

        return (
          <div class="space-y-6">
            <section class="rounded-3xl border border-line bg-surface-elevated p-5 shadow-sm sm:p-6">
              <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex min-w-0 items-center gap-4">
                  <UserAvatar
                    src={details().profile.avatarUrl}
                    name={name()}
                    alt=""
                    class="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-line bg-action-subtle text-sm font-extrabold text-content-accent"
                  />
                  <div class="min-w-0">
                    <p class="text-eyebrow">{t('accountoverview.account')}</p>
                    <p class="text-muted mt-1">
                      {details().profile.username
                        ? `@${details().profile.username}`
                        : t('accountoverview.completeProfileAppearPublicly')}
                    </p>
                  </div>
                </div>
                <a href={routes.account.profile} class="action action-secondary">
                  {t('accountoverview.editProfile')}
                </a>
              </div>
            </section>

            <section aria-labelledby="account-status-heading">
              <div class="mb-3 flex items-center gap-2">
                <CircleCheck class="size-4 text-content-accent" aria-hidden="true" />
                <h2 id="account-status-heading" class="heading-callout text-sm">
                  {t('accountoverview.statusAccount')}
                </h2>
              </div>
              <div class="grid gap-3 lg:grid-cols-3">
                <For each={statuses()}>
                  {(item) => {
                    return (
                      <article class="rounded-2xl border border-line bg-surface-elevated p-4 shadow-sm sm:p-5">
                        <div class="flex items-start gap-3">
                          <span
                            class={`inline-flex size-9 shrink-0 items-center justify-center rounded-xl ${item.ready ? 'bg-success-bg text-success' : 'bg-action-subtle text-content-accent'}`}
                          >
                            {item.icon}
                          </span>
                          <div>
                            <h3 class="heading-callout">
                              {item.label}
                            </h3>
                            <p class="text-muted-body mt-1">
                              {item.detail}
                            </p>
                          </div>
                        </div>
                        <a
                          href={item.href}
                          class="mt-4 inline-flex text-sm font-semibold text-content-accent hover:text-action-hover"
                        >
                          {item.action} →
                        </a>
                      </article>
                    );
                  }}
                </For>
              </div>
            </section>

            <section aria-labelledby="account-areas-heading">
              <div class="mb-3 flex items-center justify-between gap-3">
                <h2 id="account-areas-heading" class="heading-callout text-sm">
                  {t('accountoverview.resumeWork')}
                </h2>
                <span class="text-xs text-content-muted">{t('accountoverview.allYouPublicTracks')}</span>
              </div>
              <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <For each={areas}>
                  {(area) => {
                    return (
                      <a
                        href={area.href}
                        class="group rounded-2xl border border-line bg-surface-elevated p-4 shadow-sm transition duration-standard ease-standard hover:-translate-y-0.5 hover:border-action-border hover:shadow-md"
                      >
                        <span class="inline-flex size-9 items-center justify-center rounded-xl bg-action-subtle text-content-accent">
                          {area.icon}
                        </span>
                        <p class="text-strong mt-3 group-hover:text-content-accent">
                          {area.label}
                        </p>
                        <p class="text-muted-body mt-1">
                          {area.detail}
                        </p>
                        <span class="mt-3 inline-flex text-xs font-semibold text-content-accent">
                          {t('accountoverview.openArea')}
                        </span>
                      </a>
                    );
                  }}
                </For>
              </div>
            </section>
          </div>
        );
      }}
    </Show>
  );
}

export default withLocale(AccountOverview);
