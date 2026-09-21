import { Archive, ArchiveRestore, LogOut, Plus, Save, Trash } from 'lucide-solid';
import DestructiveConfirmation from '@/shared/ui/components/feedback/destructive-confirmation.component.tsx';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import Select from '@/shared/ui/components/forms/select.component.tsx';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import { createEffect, createSignal, For, Show } from 'solid-js';
import { createForm, reset, setValue, setValues } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import type { UpdateOrganizationInput } from '@/features/organization/types/organization.type.ts';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/organization/i18n';
import { routes } from '@/shared/navigation/routes';
import { redirectTo } from '@/shared/utils/redirect.util.ts';
import { useOrganizationSettings } from '../hooks/use-organization-settings.hook.ts';
import {
  createOrganizationFormSchema,
  createOrganizationMemberSchema,
  type OrganizationFormInput,
  type OrganizationMemberFormInput,
} from '@/features/organization/ui/schemas/forms.schema.ts';

const organizationTypes = [
  'company',
  'community',
  'open_source',
  'foundation',
  'group',
  'institution',
  'other',
] as const;
const organizationTypeLabelKeys = {
  company: 'organizationcreateform.company',
  community: 'organizationcreateform.community',
  open_source: 'organizationcreateform.openSource',
  foundation: 'organizationcreateform.foundation',
  group: 'organizationcreateform.group',
  institution: 'organizationcreateform.institution',
  other: 'organizationcreateform.other',
} as const;

function OrganizationSettings(props: { slug: string }) {
  const { t, locale } = useI18n();
  const memberSchema = createOrganizationMemberSchema(locale());
  const detailsSchema = createOrganizationFormSchema(locale());
  const settings = useOrganizationSettings(() => props.slug);
  const [memberForm, { Form, Field: FormField }] = createForm<OrganizationMemberFormInput>({
    validate: zodForm(memberSchema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });

  const [confirmDelete, setConfirmDelete] = createSignal(false);
  const [confirmLeave, setConfirmLeave] = createSignal(false);
  const [_detailsForm, { Form: DetailsForm, Field: DetailsField }] = createForm<OrganizationFormInput>({
    initialValues: { name: '', type: 'other', description: '', websiteUrl: null },
    validate: zodForm(detailsSchema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });

  createEffect(() => {
    const current = settings.organization();
    if (!current) return;
    setValues(
      _detailsForm,
      { name: current.name, type: current.type, description: current.description, websiteUrl: current.websiteUrl },
      { shouldTouched: false, shouldDirty: false, shouldValidate: false },
    );
  });

  const roleOptions = () => [
    { value: 'owner' as const, label: t('organizationsettings.owner') },
    { value: 'admin' as const, label: t('organizationsettings.admin') },
    { value: 'member' as const, label: t('organizationsettings.member') },
  ];

  const add = async (value: OrganizationMemberFormInput) => {
    const parsed = memberSchema.safeParse(value);
    if (!parsed.success) return;
    const added = await settings.add(parsed.data.accountId, parsed.data.role);
    if (added) reset(memberForm);
  };

  const saveDetails = async (value: OrganizationFormInput) => {
    const input: UpdateOrganizationInput = {
      ...value,
      name: value.name.trim(),
      description: value.description.trim(),
      websiteUrl: value.websiteUrl?.trim() || null,
    };
    await settings.updateDetails(input);
  };

  const deleteOrganization = async () => {
    if (await settings.deleteCurrent()) redirectTo(routes.account.organizations);
  };

  const leaveOrganization = async () => {
    if (await settings.leaveCurrent()) redirectTo(routes.account.organizations);
  };

  return (
    <Show when={!settings.loading()} fallback={<LoadingState>{t('myorganizations.loading')}</LoadingState>}>
      <Show when={settings.organization()} fallback={<p role="alert" class="text-danger">{settings.error()}</p>}>
        {(current) => {
          const canManage = () => current().membershipRole === 'owner' || current().membershipRole === 'admin';
          const isOwner = () => current().membershipRole === 'owner';
          return (
            <div class="grid gap-8">
              <section class="grid gap-4 rounded-2xl border border-line bg-surface-elevated p-5 sm:p-6">
                <header class="grid gap-1">
                  <h2 class="heading-card text-lg">
                    {t('organizationsettings.details')}
                  </h2>
                  <p class="text-muted-body">{t('organizationsettings.detailsDescription')}</p>
                </header>

                <DetailsForm class="grid gap-4" onSubmit={saveDetails}>
                  <Field>
                    <label for="organization-settings-name" class="field-label">{t('organizationcreateform.name')}</label>
                    <DetailsField name="name">
                      {(_, fieldProps) => (
                        <input {...fieldProps} id="organization-settings-name" disabled={!canManage()} required  class="field-control"/>
                      )}
                    </DetailsField>
                  </Field>
                  <Field>
                    <label for="organization-settings-type" class="field-label">{t('organizationcreateform.type')}</label>
                    <DetailsField name="type">
                      {(field) => (
                        <Select<(typeof organizationTypes)[number]>
                          id="organization-settings-type"
                          value={field.value ?? 'other'}
                          disabled={!canManage()}
                          ariaLabel={t('organizationcreateform.type')}
                          options={organizationTypes.map((value) => ({
                            value,
                            label: t(organizationTypeLabelKeys[value]),
                          }))}
                          onChange={(value) => setValue(_detailsForm, 'type', value)}
                        />
                      )}
                    </DetailsField>
                  </Field>
                  <Field>
                    <label for="organization-settings-description" class="field-label">
                      {t('organizationcreateform.description')}
                    </label>
                    <DetailsField name="description">
                      {(_, fieldProps) => (
                        <textarea
                          {...fieldProps}
                          id="organization-settings-description"
                          disabled={!canManage()}
                          required
                          rows={5}
                         class="field-control resize-y"/>
                      )}
                    </DetailsField>
                  </Field>
                  <Field>
                    <label for="organization-settings-website" class="field-label">{t('organizationcreateform.website')}</label>
                    <DetailsField name="websiteUrl">
                      {(_, fieldProps) => (
                        <input {...fieldProps} id="organization-settings-website" type="url" disabled={!canManage()}  class="field-control"/>
                      )}
                    </DetailsField>
                  </Field>
                  <Show when={canManage()}>
                    <div class="flex justify-end">
                      <button type="submit" disabled={settings.saving()} class="action action-primary">
                        <Save class="size-4" aria-hidden="true" />
                        {settings.saving() ? t('organizationsettings.saving') : t('organizationsettings.save')}
                      </button>
                    </div>
                  </Show>
                </DetailsForm>
              </section>

              <section class="grid gap-4">
                <header class="grid gap-1">
                  <h2 class="heading-card text-lg">
                    {t('organizationsettings.members')} {current().name}
                  </h2>
                  <p class="text-muted">{t('organizationsettings.membersDescription')}</p>
                </header>
                <div class="grid gap-2">
                  <For each={settings.members()}>
                    {(membership) => {
                      const pending = () => settings.pendingAccountId() === membership.accountId;
                      return (
                        <div class="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-4">
                          <span class="min-w-56 flex-1">
                            <strong class="text-content">
                              {membership.displayName || membership.username || membership.accountId}
                            </strong>
                            <span class="block text-xs text-content-muted">{membership.accountId}</span>
                          </span>
                          <div class="w-40">
                            <Select
                              id={`organization-member-role-${membership.accountId}`}
                              value={membership.role}
                              options={roleOptions()}
                              disabled={pending() || !isOwner()}
                              onChange={(role) => void settings.changeRole(membership, role)}
                            />
                          </div>
                          <Show when={isOwner()}>
                            <button
                             
                              type="button"
                              disabled={pending()}
                              onClick={() => void settings.remove(membership)} class="action action-danger-outline"
                            >
                              <Trash class="size-4" aria-hidden="true" />
                              {t('organizationsettings.remove')}
                            </button>
                          </Show>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </section>

              <Show when={isOwner()}>
                <section class="grid gap-3">
                  <header class="grid gap-1">
                    <h2 class="heading-card text-lg">
                      {t('organizationsettings.addMember')}
                    </h2>
                    <p class="text-muted">{t('organizationsettings.addMemberDescription')}</p>
                  </header>
                  <Form onSubmit={add} class="flex flex-wrap gap-3">
                    <div class="min-w-64 flex-1">
                      <FormField name="accountId">
                        {(_, fieldProps) => (
                          <input
                            {...fieldProps}
                            required
                            disabled={settings.adding()}
                            placeholder={t('organizationsettings.accountUuid')}
                           class="field-control"/>
                        )}
                      </FormField>
                    </div>
                    <div class="w-40">
                      <FormField name="role">
                        {(field) => (
                          <Select<'member' | 'admin' | 'owner'>
                            id="organization-new-member-role"
                            value={field.value ?? 'member'}
                            disabled={settings.adding()}
                            ariaLabel={t('organizationsettings.member')}
                            options={roleOptions()}
                            onChange={(value) => setValue(memberForm, 'role', value)}
                          />
                        )}
                      </FormField>
                    </div>
                    <button disabled={settings.adding()} class="action action-primary">
                      <Plus class="size-4" aria-hidden="true" />
                      {t('organizationsettings.add')}
                    </button>
                  </Form>
                </section>
              </Show>

              <section class="grid gap-4 rounded-2xl border border-line bg-surface-elevated p-5 sm:p-6">
                <header class="grid gap-1">
                  <h2 class="heading-card text-lg">
                    {t('organizationsettings.lifecycle')}
                  </h2>
                  <p class="text-muted">{t('organizationsettings.lifecycleDescription')}</p>
                </header>
                <div class="flex flex-wrap items-center gap-2">
                  <Show when={isOwner()}>
                    <button
                      type="button"
                     
                      disabled={settings.lifecycleBusy()}
                      onClick={() =>
                        void settings.changeLifecycle(current().status === 'archived' ? 'unarchive' : 'archive')
                      } class="action action-secondary"
                    >
                      {current().status === 'archived' ? (
                        <ArchiveRestore class="size-4" aria-hidden="true" />
                      ) : (
                        <Archive class="size-4" aria-hidden="true" />
                      )}
                      {current().status === 'archived'
                        ? t('organizationsettings.unarchive')
                        : t('organizationsettings.archive')}
                    </button>
                  </Show>
                  <button
                    type="button"
                   
                    disabled={settings.lifecycleBusy()}
                    onClick={() => setConfirmLeave(true)} class="action action-secondary"
                  >
                    <LogOut class="size-4" aria-hidden="true" />
                    {t('organizationsettings.leave')}
                  </button>
                  <Show when={isOwner()}>
                    <button
                      type="button"
                     
                      disabled={settings.lifecycleBusy()}
                      onClick={() => setConfirmDelete(true)} class="action action-danger-outline"
                    >
                      <Trash class="size-4" aria-hidden="true" />
                      {t('organizationsettings.delete')}
                    </button>
                  </Show>
                </div>

                <Show when={confirmLeave()}>
                  <DestructiveConfirmation
                    accessibleLabel={t('organizationsettings.leave')}
                    title={t('organizationsettings.leaveTitle')}
                    description={t('organizationsettings.leaveDescription')}
                    confirmLabel={t('organizationsettings.leave')}
                    cancelLabel={t('organizationsettings.cancel')}
                    busy={settings.lifecycleBusy()}
                    onConfirm={() => void leaveOrganization()}
                    onCancel={() => setConfirmLeave(false)}
                  />
                </Show>
                <Show when={confirmDelete()}>
                  <DestructiveConfirmation
                    accessibleLabel={t('organizationsettings.delete')}
                    title={t('organizationsettings.deleteTitle')}
                    description={t('organizationsettings.deleteDescription')}
                    confirmLabel={t('organizationsettings.delete')}
                    cancelLabel={t('organizationsettings.cancel')}
                    busy={settings.lifecycleBusy()}
                    onConfirm={() => void deleteOrganization()}
                    onCancel={() => setConfirmDelete(false)}
                  />
                </Show>
              </section>

              <Show when={settings.error()}>
                <p role="alert" class="text-danger">{settings.error()}</p>
              </Show>
            </div>
          );
        }}
      </Show>
    </Show>
  );
}

export default withLocale(OrganizationSettings);
