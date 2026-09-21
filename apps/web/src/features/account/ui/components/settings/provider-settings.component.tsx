import { withLocale } from '@/shared/i18n/core/solid';
import { createEffect, createSignal, Show } from 'solid-js';
import { useI18n } from '@/features/account/i18n';
import SectionCard, { SectionCardBody, SectionCardHeading } from '@/shared/ui/components/surfaces/section-card.component.tsx';
import OAuthProviderCard from '../widgets/settings/providers/o-auth-provider-card.component.tsx';
import { providerLabel, type AuthIdentityProvider } from '../widgets/settings/utils.component.ts';
import { useSettingsAccount } from '../../hooks/settings/use-settings-account.hook.ts';
import { useSettingsProviders } from '../../hooks/settings/use-settings-providers.hook.ts';
import { removeQueryParam } from '../widgets/settings/navigation.component.ts';
import SettingsState from './settings-state.component.tsx';
import { RefreshCw } from 'lucide-solid';
import Alert from '@/shared/ui/components/feedback/alert.component.tsx';

function ProviderSettings() {
  const { t } = useI18n();
  const account = useSettingsAccount();
  const providers = useSettingsProviders();
  const [loaded, setLoaded] = createSignal(false);
  const [linkedProvider, setLinkedProvider] = createSignal<AuthIdentityProvider | null>(null);

  createEffect(() => {
    if (account.loading() || account.failed() || loaded()) return;
    setLoaded(true);
    void providers.refreshProviders();
    const linked = new URLSearchParams(window.location.search).get('linked');
    if (linked === 'github' || linked === 'google') setLinkedProvider(linked);
    if (linked) removeQueryParam('linked');
  });

  return (
    <SettingsState
      loading={account.loading() || !loaded() || providers.loading()}
      failed={account.failed() || providers.failed()}
    >
      <SectionCard>
        <SectionCardHeading
          title={t('providerssection.connectionsLogin')}
          description={t('providerssection.externalProvidersOnly')}
        />
        <SectionCardBody>
          <div class="flex flex-col gap-4">
            <Show when={providers.operationError()}>{(error) => <Alert status="danger">{error()}</Alert>}</Show>
            <Show when={linkedProvider()}>
              {(provider) => (
                <Alert status="success">
                  {providerLabel(provider(), t)} {t('providerssection.wasLinkedSuccess')}
                </Alert>
              )}
            </Show>
            <div class="grid gap-4 sm:grid-cols-2">
              <OAuthProviderCard
                provider="github"
                identities={providers.githubIdentities()}
                pending={providers.pendingProvider() === 'github'}
                onLink={() => void providers.link('github')}
                onUnlink={() => void providers.unlink('github')}
              />
              <OAuthProviderCard
                provider="google"
                identities={providers.googleIdentities()}
                pending={providers.pendingProvider() === 'google'}
                onLink={() => void providers.link('google')}
                onUnlink={() => void providers.unlink('google')}
              />
            </div>
            <div class="self-start">
              <button
               
                type="button"
                disabled={providers.pendingProvider() !== null}
                onClick={() => void providers.refreshProviders()} class="action action-secondary"
              >
                <RefreshCw class="size-4" />
                {t('providerssection.updateList')}
              </button>
            </div>
          </div>
        </SectionCardBody>
      </SectionCard>
    </SettingsState>
  );
}

export default withLocale(ProviderSettings);
