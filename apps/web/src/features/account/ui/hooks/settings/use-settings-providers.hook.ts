import { createMemo, createSignal } from 'solid-js';
import type { AuthIdentityDTO } from '@/features/account/types/account.type.ts';
import { useAccount } from '@/features/account/ui/hooks/use-account.hook.ts';
import { useAuth } from '@/features/auth/public';
import { useI18n } from '@/features/account/i18n';
import { routes } from '@/shared/navigation/routes';

export type OAuthProvider = 'github' | 'google';
export type ProviderIdentity = AuthIdentityDTO & { provider: string };

export function useSettingsProviders() {
  const { t } = useI18n();
  const { refreshOAuthLinks, unlinkOAuthProvider } = useAccount();
  const { startOAuth } = useAuth();
  const [identities, setIdentities] = createSignal<ProviderIdentity[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [failed, setFailed] = createSignal(false);
  const [pendingProvider, setPendingProvider] = createSignal<OAuthProvider | null>(null);
  const [operationError, setOperationError] = createSignal<string | null>(null);

  const githubIdentities = createMemo(() => identities().filter((item) => item.provider === 'github'));
  const googleIdentities = createMemo(() => identities().filter((item) => item.provider === 'google'));

  const refreshProviders = async () => {
    setLoading(true);
    setFailed(false);
    try {
      const items = await refreshOAuthLinks();
      setIdentities(items.map((item) => ({ ...item, provider: item.provider ?? 'local' })));
      return items;
    } catch {
      setFailed(true);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const link = async (provider: OAuthProvider) => {
    if (pendingProvider()) return;
    setPendingProvider(provider);
    setOperationError(null);
    try {
      const result = await startOAuth(provider, {
        flow: 'link',
        redirect: routes.account.providers,
      });
      if (result.error) {
        setOperationError(t('providerssection.couldNotStartLinkingProvider'));
        setPendingProvider(null);
        return;
      }
      const url = result.data?.data?.url;
      if (url) window.location.assign(url);
      else {
        setOperationError(t('providerssection.couldNotStartLinkingProvider'));
        setPendingProvider(null);
      }
    } catch {
      setOperationError(t('providerssection.couldNotStartLinkingProvider'));
      setPendingProvider(null);
    }
  };

  const unlink = async (provider: OAuthProvider) => {
    if (pendingProvider()) return;
    setPendingProvider(provider);
    setOperationError(null);
    try {
      const result = await unlinkOAuthProvider(provider);
      if (result) await refreshProviders();
    } finally {
      setPendingProvider(null);
    }
  };

  return {
    identities,
    githubIdentities,
    googleIdentities,
    loading,
    failed,
    pendingProvider,
    operationError,
    refreshProviders,
    link,
    unlink,
  };
}
