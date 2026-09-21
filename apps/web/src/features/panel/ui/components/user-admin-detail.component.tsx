import { Show } from 'solid-js';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/panel/i18n';
import { useUserAdminDetail } from '@/features/panel/ui/hooks/use-user-admin-detail.hook.ts';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import ErrorState from '@/shared/ui/components/feedback/error-state.component.tsx';
import UserAdminSummary from './user-detail/user-admin-summary.component.tsx';
import UserStandingPanel from './user-detail/user-standing-panel.component.tsx';
import UserRolePanel from './user-detail/user-role-panel.component.tsx';
import UserModerationPanel from './user-detail/user-moderation-panel.component.tsx';
import Surface from '@/shared/ui/components/surfaces/surface.component.tsx';

type Props = { id: string };

function UserAdminDetail(props: Props) {
  const { t, locale } = useI18n();
  const detail = useUserAdminDetail(props.id);

  return (
    <Surface variant="elevated" padding="sm">
      <Show when={!detail.loading()} fallback={<LoadingState>{t('resourceadmindetail.loading')}</LoadingState>}>
        <Show when={detail.item()} fallback={<ErrorState>{t('useradmindetail.userNotFound')}</ErrorState>}>
          {(item) => (
            <div class="space-y-4">
              <UserAdminSummary item={item()} locale={locale()} />
              <UserStandingPanel
                standing={detail.standing()}
                busy={detail.busy()}
                onRestrict={detail.restrict}
                onRevoke={detail.revokeRestriction}
              />
              <UserRolePanel
                role={detail.role()}
                busy={detail.busy()}
                onRoleChange={detail.setRole}
                onSave={() => void detail.saveRole()}
              />
              <UserModerationPanel
                busy={detail.busy()}
                canSuspend={detail.canSuspend()}
                canUnsuspend={detail.canUnsuspend()}
                canBan={detail.canBan()}
                canUnban={detail.canUnban()}
                onSuspend={detail.suspend}
                onUnsuspend={() => void detail.unsuspend()}
                onBan={() => void detail.ban()}
                onUnban={() => void detail.unban()}
                onReload={() => void detail.load()}
              />
              <Show when={detail.error()}>
                {(message) => (
                  <p role="alert" class="text-danger-caption">
                    {message()}
                  </p>
                )}
              </Show>
              <Show when={detail.success()}>
                {(message) => (
                  <p role="status" class="text-success">
                    {message()}
                  </p>
                )}
              </Show>
            </div>
          )}
        </Show>
      </Show>
    </Surface>
  );
}

export default withLocale(UserAdminDetail);
