import Surface from '@/shared/ui/components/surfaces/surface.component.tsx';
import type { OAuthProvider, ProviderIdentity } from '../../../../hooks/settings/use-settings-providers.hook.ts';
import { Link, Unlink } from 'lucide-solid';
import { For, Show } from 'solid-js';
import { useI18n } from '@/features/account/i18n';
import { providerLabel, safeDate } from '../utils.component.ts';
type Props = {
  provider: OAuthProvider;
  identities: ProviderIdentity[];
  pending: boolean;
  onLink: () => void;
  onUnlink: () => void;
};

export default function OAuthProviderCard(props: Props) {
  const { t, locale } = useI18n();
  const linked = () => props.identities.length > 0;

  return (
    <Surface padding="sm">
      <div class="flex flex-col gap-1">
        <p class="text-strong">{providerLabel(props.provider, t)}</p>
        <p class="text-caption">{linked() ? t('providers.linked') : t('providerssection.notLinked')}</p>
      </div>

      <Show when={linked()}>
        <div class="mt-3 flex flex-col gap-2">
          <For each={props.identities}>
            {(identity) => (
              <div class="flex flex-col gap-2 rounded-2xl border border-line bg-surface-elevated p-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="min-w-0">
                  <p class="text-strong truncate">
                    {identity.providerEmail}
                  </p>
                  <p class="text-caption mt-1">
                    {t('providerssection.linked')} {safeDate(identity.createdAt, locale())}
                  </p>
                </div>
                <button
                 
                  type="button"
                  disabled={props.pending || !identity.canRemove}
                  title={
                    !identity.canRemove
                      ? t('providerssection.couldNotUnlinkLastProvider')
                      : t('providerssection.unlink')
                  }
                  onClick={props.onUnlink} class="action action-secondary"
                >
                  <Unlink class="size-4" />
                  {t('providerssection.unlink')}
                </button>
              </div>
            )}
          </For>
        </div>
      </Show>

      <Show when={!linked()}>
        <div class="mt-4">
          <button type="button" disabled={props.pending} onClick={props.onLink} class="action action-primary">
            <Link class="size-4" />
            {t('providerssection.link')} {providerLabel(props.provider, t)}
          </button>
        </div>
      </Show>
    </Surface>
  );
}
