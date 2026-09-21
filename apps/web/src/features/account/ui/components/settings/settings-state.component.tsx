import Surface from '@/shared/ui/components/surfaces/surface.component.tsx';
import { useI18n } from '@/features/account/i18n';
import { Show, type JSX } from 'solid-js';
export default function SettingsState(props: { loading: boolean; failed: boolean; children: JSX.Element }) {
  const { t } = useI18n();
  return (
    <Show
      when={!props.loading}
      fallback={
        <Surface variant="elevated" padding="lg">
          <p class="text-muted">{t('settingspanel.loadingSettings')}</p>
        </Surface>
      }
    >
      <Show
        when={!props.failed}
        fallback={
          <Surface variant="elevated" padding="lg">
            <p class="text-muted">{t('settingspanel.couldNotLoadAccount')}</p>
          </Surface>
        }
      >
        {props.children}
      </Show>
    </Show>
  );
}
