import type { PublicProfileDTO } from '@/features/account/types/profile.type.ts';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/account/i18n';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import RetryErrorState from '@/shared/ui/components/feedback/retry-error-state.component.tsx';
import { usePublicProfile } from '@/features/account/ui/hooks/use-public-profile.hook.ts';
import PublicProfileHeader from './public/public-profile-header.component.tsx';
import PublicProfileContributions from './public/public-profile-contributions.component.tsx';
import PublicProfileActivity from './public/public-profile-activity.component.tsx';
import { Show } from 'solid-js';
type Props = {
  username: string;
  initialProfile?: PublicProfileDTO | null;
  initialError?: boolean;
};

function PublicProfile(props: Props) {
  const { t } = useI18n();
  const profile = usePublicProfile(props);

  return (
    <Show when={!profile.loading()} fallback={<LoadingState>{t('publicprofile.loadingProfile')}</LoadingState>}>
      <Show
        when={!profile.error()}
        fallback={
          <RetryErrorState
            message={t('publicprofile.couldNotLoadProfile')}
            retryLabel={t('profilearticles.tryAgain')}
            onRetry={() => void profile.reload()}
          />
        }
      >
        <Show when={profile.profile()} fallback={<p class="text-muted">{t('publicprofile.profileNotFound')}</p>}>
          {(data) => (
            <div class="space-y-8">
              <PublicProfileHeader
                profile={data()}
                canEdit={profile.canEdit()}
                filters={profile.filters()}
                onSelectTab={profile.setSelectedTab}
              />
              <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
                <PublicProfileContributions
                  total={profile.contributions().length}
                  filters={profile.filters()}
                  activeTab={profile.activeTab()}
                  items={profile.visibleContributions()}
                  onSelectTab={profile.setSelectedTab}
                />
                <PublicProfileActivity items={profile.interactions()} />
              </div>
            </div>
          )}
        </Show>
      </Show>
    </Show>
  );
}

export default withLocale(PublicProfile);
