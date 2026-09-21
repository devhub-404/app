import { createEffect, createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';
import { listMyJobs } from '@/features/job/actions/job.action.ts';
import { closeJob, renewJob, updateJob, withdrawJob } from '@/features/job/actions/job.action.ts';
import type { Job } from '@/features/job/types/job.type.ts';
import { canCloseJob, canEditJob, canRenewJob, canWithdrawJob } from '@/features/job/access/job.access.ts';
import { isJobClosable, isJobEditable, isJobRenewable, isJobWithdrawable } from '@/features/job/domain/job.domain.ts';
import { routes } from '@/shared/navigation/routes';
import { redirectTo } from '@/shared/utils/redirect.util.ts';
import { useI18n } from '@/features/job/i18n';
import { useJobActor } from './use-job-actor.hook.ts';
import type { JobFormInput } from '@/features/job/ui/schemas/forms.schema.ts';

export function useEditJob(id: string) {
  const { t } = useI18n();
  const [state, setState] = createStore({ job: null as Job | null, loading: true, busy: false, error: '' });
  const { actor, loading: actorLoading } = useJobActor();
  let loaded = false;

  createEffect(() => {
    if (loaded || actorLoading()) return;
    loaded = true;
    void (async () => {
      const result = await listMyJobs({ page: 1, pageSize: 100 });
      const candidate = result.data?.data?.items.find((item) => item.id === id);
      setState({
        job: candidate && canEditJob(candidate, actor()) && isJobEditable(candidate) ? candidate : null,
        loading: false,
      });
    })();
  });

  const patch = <K extends keyof Job>(field: K, value: Job[K]) => {
    const current = state.job;
    if (current) setState('job', { ...current, [field]: value });
  };

  const save = async (formValue?: JobFormInput) => {
    const current = state.job;
    if (!current || state.busy || !(canEditJob(current, actor()) && isJobEditable(current))) return;
    setState({ busy: true, error: '' });
    try {
      const value = formValue ?? {
        title: current.title,
        description: current.description,
        employmentType: current.employmentType,
        workplaceType: current.workplaceType,
        location: current.location,
        compensationMin: current.compensationMin,
        compensationMax: current.compensationMax,
        compensationCurrency: current.compensationCurrency,
        compensationUnit: current.compensationUnit,
        applicationUrl: current.applicationUrl,
        tagSlugs: current.tagSlugs,
      };
      const amount = (input: number | string | null | undefined) =>
        input === '' || input === null || input === undefined ? null : Number(input);
      const result = await updateJob(current.id, {
        ...value,
        title: value.title.trim(),
        description: value.description.trim(),
        location: value.location?.trim() || null,
        applicationUrl: value.applicationUrl.trim(),
        compensationMin: amount(value.compensationMin),
        compensationMax: amount(value.compensationMax),
        tagSlugs: value.tagSlugs ?? [],
      });
      if (result.error) setState('error', t('editjob.couldNotUpdateJob'));
      else redirectTo(routes.account.jobs);
    } finally {
      setState('busy', false);
    }
  };

  const changeLifecycle = async (action: 'close' | 'renew' | 'withdraw') => {
    const current = state.job;
    if (!current || state.busy) return;
    const allowed =
      action === 'close'
        ? canCloseJob(current, actor()) && isJobClosable(current)
        : action === 'renew'
          ? canRenewJob(current, actor()) && isJobRenewable(current)
          : canWithdrawJob(current, actor()) && isJobWithdrawable(current);
    if (!allowed) return;
    setState({ busy: true, error: '' });
    try {
      const result =
        action === 'close'
          ? await closeJob(current.id)
          : action === 'renew'
            ? await renewJob(current.id)
            : await withdrawJob(current.id);
      if (result.error) setState('error', t('editjob.changeNotCanBeAppliedUpdateStatusJobtryAgain'));
      else if (action === 'withdraw') redirectTo(routes.account.jobs);
      else if (result.data?.data) setState('job', result.data.data);
    } finally {
      setState('busy', false);
    }
  };

  return {
    job: () => state.job,
    loading: () => state.loading,
    busy: () => state.busy,
    error: () => state.error,
    patch,
    save,
    changeLifecycle,
    canClose: createMemo(() => Boolean(state.job && canCloseJob(state.job, actor()) && isJobClosable(state.job))),
    canRenew: createMemo(() => Boolean(state.job && canRenewJob(state.job, actor()) && isJobRenewable(state.job))),
    canWithdraw: createMemo(() =>
      Boolean(state.job && canWithdrawJob(state.job, actor()) && isJobWithdrawable(state.job)),
    ),
  };
}
