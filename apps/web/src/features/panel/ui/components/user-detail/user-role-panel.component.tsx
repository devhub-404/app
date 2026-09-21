import { Save } from 'lucide-solid';
import { RadioGroup } from '@ark-ui/solid';
import type { UserRole } from '@/features/panel/types/panel.type.ts';
import { useI18n } from '@/features/panel/i18n';

const ROLE_OPTIONS: UserRole[] = ['curator', 'moderator', 'admin'];

export default function UserRolePanel(props: {
  role: UserRole | null;
  busy: boolean;
  onRoleChange: (role: UserRole | null) => void;
  onSave: () => void;
}) {
  const { t } = useI18n();
  return (
    <section
      class="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3"
      aria-labelledby="user-role-heading"
    >
      <h2 id="user-role-heading" class="heading-tiny text-xs">
        {t('useradmindetail.rolesAdministrative')}
      </h2>
      <p class="text-caption">{t('useradmindetail.withoutSelectionAccountRemainsOnlyHowUserCommonRolesBecome')}</p>
      <div class="flex flex-wrap items-center gap-3">
        <RadioGroup.Root
          value={props.role ?? ''}
          onValueChange={(details) => details.value && props.onRoleChange(details.value as UserRole)}
          disabled={props.busy}
          aria-label={t('useradmindetail.rolesAdministrative')}
          class="flex flex-wrap gap-3"
        >
          {ROLE_OPTIONS.map((roleValue) => (
            <RadioGroup.Item value={roleValue} class="flex items-center gap-2 text-xs text-content">
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemControl class="size-4 rounded-full border border-line bg-surface outline-none transition data-[state=checked]:border-action data-[state=checked]:bg-action focus-visible:ring-2 focus-visible:ring-focus/40" />
              <RadioGroup.ItemText>{roleValue}</RadioGroup.ItemText>
            </RadioGroup.Item>
          ))}
        </RadioGroup.Root>
        <button
         
          type="button"
          disabled={props.busy || props.role === null}
          onClick={() => props.onRoleChange(null)} class="action action-secondary"
        >
          {t('useradmindetail.noRole')}
        </button>
      </div>
      <div>
        <button type="button" onClick={props.onSave} disabled={props.busy} class="action action-primary">
          <Save class="size-4" aria-hidden="true" />
          {t('useradmindetail.saveRole')}
        </button>
      </div>
    </section>
  );
}
