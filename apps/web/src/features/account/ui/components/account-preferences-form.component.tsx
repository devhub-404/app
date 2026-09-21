import Select from '@/shared/ui/components/forms/select.component.tsx';
import { createAccountPreferencesSchema, type AccountPreferencesInput } from '@/features/account/ui/schemas/preferences.schema.ts';
import { createForm, setValue, setValues } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { Save } from 'lucide-solid';
import { useAccount } from '@/features/account/ui/hooks/use-account.hook.ts';
import LocaleSelector from '@/features/account/ui/components/locale-selector.component.tsx';
import { useI18n } from '@/features/account/i18n';
import { withLocale } from '@/shared/i18n/core/solid';
import { createEffect, createSignal, onMount, Show } from 'solid-js';
function AccountPreferencesForm() {
  const { t, locale } = useI18n();
  const { state: account, updatePreferences } = useAccount();
  const { getPreferences } = useAccount();
  const [hydrated, setHydrated] = createSignal(false);
  const [saving, setSaving] = createSignal(false);
  const [feedback, setFeedback] = createSignal<string | null>(null);
  const [form, { Form, Field }] = createForm<AccountPreferencesInput>({
    validate: zodForm(createAccountPreferencesSchema(locale())),
    validateOn: 'submit',
    revalidateOn: 'input',
  });

  onMount(() => {
    void getPreferences();
  });

  createEffect(() => {
    const preferences = account().details?.preferences;
    if (!preferences || hydrated()) return;
    setValues(form, { profileVisibility: preferences.profileVisibility });
    setHydrated(true);
  });

  const save = async (values: AccountPreferencesInput) => {
    setSaving(true);
    setFeedback(null);
    try {
      const parsed = createAccountPreferencesSchema(locale()).safeParse(values);
      if (!parsed.success) {
        setFeedback(parsed.error.issues[0]?.message ?? t('preferences.saveError'));
        return;
      }
      const ok = await updatePreferences(parsed.data);
      if (ok) {
        setFeedback(t('preferences.saved'));
        return;
      }
      setFeedback(t('preferences.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form onSubmit={save} class="rounded-3xl border border-line bg-surface-elevated p-5 shadow-sm sm:p-6">
      <div class="max-w-2xl">
        <p class="text-muted-body">{t('preferences.description')}</p>
        <div class="mt-6 max-w-xs">
          <span class="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-content-muted">
            {t('preferences.language')}
          </span>
          <LocaleSelector locale={locale()} />
        </div>
        <div class="mt-6">
          <label
            for="preferences-profile-visibility"
            class="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-content-muted"
          >
            {t('preferences.visibility')}
          </label>
          <Field name="profileVisibility">
            {(field) => (
              <Select<'public' | 'private'>
                id="preferences-profile-visibility"
                value={field.value === 'private' ? 'private' : 'public'}
                ariaLabel={t('preferences.visibility')}
                options={[
                  { value: 'public', label: t('preferences.public') },
                  { value: 'private', label: t('preferences.private') },
                ]}
                onChange={(value) => setValue(form, 'profileVisibility', value)}
              />
            )}
          </Field>
        </div>
        <div class="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={saving() || !hydrated()} class="action action-primary">
            <Save class="size-4" aria-hidden="true" />
            {saving() ? t('preferences.saving') : t('preferences.save')}
          </button>
          <Show when={feedback()}>
            <p role="status" class="text-muted">
              {feedback()}
            </p>
          </Show>
        </div>
      </div>
    </Form>
  );
}

export default withLocale(AccountPreferencesForm);
