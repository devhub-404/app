import { createMemo, createSignal, Show } from 'solid-js';
import { createForm, reset } from '@modular-forms/solid';
import SectionCard, { SectionCardBody, SectionCardHeading } from '@/shared/ui/components/surfaces/section-card.component.tsx';
import { useAccount } from '@/features/account/ui/hooks/use-account.hook.ts';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { CirclePause, TriangleAlert, UserRoundX, Power, X, Trash } from 'lucide-solid';
import PossessionProofStep from '../security/possession-proof-step.component.tsx';
import { usePossessionProofFlow } from '../../../../hooks/use-possession-proof-flow.hook.ts';
import { useI18n } from '@/features/account/i18n';
import { createDeleteAccountConfirmationSchema, type DeleteAccountConfirmationFormInput } from '@/features/account/ui/schemas/security.schema.ts';
import { redirectTo } from '@/shared/utils/redirect.util.ts';
import { routes } from '@/shared/navigation/routes';
function DangerSection() {
  const { t, locale } = useI18n();
  const { state: account, disableAccount, deleteAccount } = useAccount();
  const [busy, setBusy] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = createSignal(false);
  const [deletionForm, { Form: DeletionForm, Field: DeletionField }] = createForm<DeleteAccountConfirmationFormInput>({
    validate: zodForm(createDeleteAccountConfirmationSchema(locale())),
  });
  const proof = usePossessionProofFlow();
  const voluntaryStatus = createMemo(() => account().details?.account.voluntaryStatus ?? null);

  const deactivate = async () => {
    if (busy() || voluntaryStatus() !== 'active') return;
    setBusy(true);
    try {
      const ok = await disableAccount();
      if (ok) redirectTo(routes.auth.signIn);
    } finally {
      setBusy(false);
    }
  };

  const requestDeletion = async () => {
    setError(null);
    setBusy(true);
    try {
      const result = await proof.execute(
        () => deleteAccount(),
        () => redirectTo(routes.auth.signIn),
      );
      if (result.kind === 'failure') setError(t('securitysection.operationNotCanBeConcluidatryAgain'));
      else reset(deletionForm);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SectionCard id="zona-de-risco">
      <Show when={proof.open()}>
        <PossessionProofStep
          busy={proof.busy()}
          proofSent={proof.sent()}
          reauthRequired={proof.mfaRequired()}
          mfaRequired={proof.mfaRequired()}
          error={proof.error()}
          onRequest={() => void proof.request()}
          onConfirm={(input) => void proof.confirm(input)}
          onClose={proof.dismiss}
        />
      </Show>
      <SectionCardHeading
        title={t('accountoverview.manageAccount')}
        description={t('dangersection.actionsEndAccessChooseTransitionMatchesIntent')}
      />
      <SectionCardBody>
        <div class="grid gap-5 lg:grid-cols-2">
          <section class="rounded-2xl border border-line bg-surface p-5">
            <div class="flex items-start gap-3">
              <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-warning-bg text-warning">
                <CirclePause class="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 class="heading-callout">
                  {t('dangersection.disableTemporarily')}
                </h3>
                <p class="text-muted-body mt-1">
                  {t('dangersection.closesSessionRevokesAccessYouCanReactivateByFlowLogin')}
                </p>
              </div>
            </div>
            <p class="text-muted-compact mt-4 rounded-xl bg-surface-subtle px-3 py-2">
              {t('dangersection.statusCurrent')}{' '}
              <strong class="text-content">
                {voluntaryStatus() === 'active'
                  ? t('dangersection.accountActive')
                  : voluntaryStatus() === 'deactivated'
                    ? t('dangersection.accountDisabled')
                    : t('dangersection.unavailable')}
              </strong>{' '}
              {t('dangersection.backBetweenAgainCompleteFlowAccess')}{' '}
            </p>
            <div class="mt-4">
              <Show
                when={confirmDeactivate()}
                fallback={
                  <button
                    type="button"
                    disabled={busy() || voluntaryStatus() !== 'active'}
                    onClick={() => setConfirmDeactivate(true)} class="action action-secondary"
                   
                  >
                    <Power class="size-4" />
                    {t('dangersection.disableAccount')}
                  </button>
                }
              >
                <div class="rounded-xl border border-warning-border bg-warning-bg p-3">
                  <p class="text-body">{t('dangersection.youWillLoseAccessNowConfirmsDeactivation')}</p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <button type="button" disabled={busy()} onClick={() => void deactivate()} class="action action-ghost">
                      <Power class="size-4" />
                      {busy() ? t('danger.deactivating') : t('dangersection.confirmDeactivation')}
                    </button>
                    <button
                      type="button"
                      disabled={busy()}
                      onClick={() => setConfirmDeactivate(false)} class="action action-secondary"
                     
                    >
                      <X class="size-4" />
                      {t('myarticles.cancel')}
                    </button>
                  </div>
                </div>
              </Show>
            </div>
          </section>

          <section class="rounded-2xl border border-danger-border bg-danger-bg p-5">
            <div class="flex items-start gap-3">
              <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-danger-bg text-danger">
                <UserRoundX class="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 class="heading-callout">
                  {t('dangersection.deleteAccount')}
                </h3>
                <p class="text-muted-body mt-1">
                  {t('dangersection.startsDeletionRetentionAfterPurgenoRestorationNormal')}
                </p>
              </div>
            </div>
            <p class="text-muted-compact mt-4 rounded-xl bg-surface px-3 py-2">
              <TriangleAlert class="mr-1 inline size-3.5 text-danger" aria-hidden="true" />
              {t('dangersection.thisRequestClosesAccessRestorationDuringRetentionRequiresFlowRecovery')}
            </p>
            <DeletionForm onSubmit={requestDeletion} class="mt-4 grid gap-3">
              <DeletionField name="confirmation">
                {(field, fieldProps) => (
                  <Field invalid={Boolean(field.error)}>
                    <label for="delete-account-confirmation" class="field-label">
                      {t('dangersection.type')} <span class="font-mono text-danger">{t('dangersection.delete')}</span>{' '}
                      {t('dangersection.confirm')}
                    </label>
                    <input
                      {...fieldProps}
                      id="delete-account-confirmation"
                      autocomplete="off"
                      value={field.value ?? ''}
                      aria-invalid={Boolean(field.error)}
                     class="field-control"/>
                    {field.error ? <p class="text-danger">
                  {error()}
                </p> : null}
                  </Field>
                )}
              </DeletionField>
              <Show when={error()}>
                <p role="alert" class="text-danger">
                  {error()}
                </p>
              </Show>
              <button type="submit" disabled={busy()} aria-busy={busy()} class="action action-danger">
                <Trash class="size-4" />
                {busy() ? t('danger.requesting') : t('dangersection.requestDeletion')}
              </button>
            </DeletionForm>
          </section>
        </div>
      </SectionCardBody>
    </SectionCard>
  );
}

export default DangerSection;
