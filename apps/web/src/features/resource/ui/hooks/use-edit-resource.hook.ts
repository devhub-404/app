import { onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { ResourceItem } from '@/features/resource/types/resource.type.ts';
import {
  archiveResource,
  deleteResource,
  loadResourceById,
  unarchiveResource,
  updateResource,
} from '@/features/resource/actions/resource.action.ts';
import { useAccount } from '@/features/account/public';
import {
  canArchiveResource,
  canDeleteResource,
  canManageResources,
  canUnarchiveResource,
} from '@/features/resource/access/resource.access.ts';
import { isResourceArchivable, isResourceUnarchivable } from '@/features/resource/domain/resource.domain.ts';
import { redirectTo } from '@/shared/utils/redirect.util.ts';
import type { ResourceSubmitData } from '@/features/resource/ui/types/resource-submit.type.ts';
import { notifyError, notifySuccess } from '@/shared/ui/feedback/notifications';

type EditResourceState = {
  loading: boolean;
  busy: boolean;
  existing: ResourceItem | null;
  formDefaults: ResourceSubmitData;
  error: string | null;
  confirmDelete: boolean;
};

export function useEditResource(id: () => string) {
  const { state: account } = useAccount();
  const [state, setState] = createStore<EditResourceState>({
    loading: true,
    busy: false,
    existing: null,
    formDefaults: { title: '', description: '', url: '', tags: [] },
    error: null,
    confirmDelete: false,
  });

  const actor = () => ({
    accountId: account().details?.account.id ?? null,
    role: account().details?.role ?? null,
    organizationIds: [],
    ownerOrganizationIds: [],
  });

  const load = async () => {
    setState('loading', true);
    try {
      const resource = await loadResourceById(id());
      setState('existing', resource ?? null);
      if (!resource) return;
      setState('formDefaults', {
        title: resource.title ?? '',
        description: resource.description ?? '',
        url: resource.url ?? '',
        tags: resource.tags?.map((tag) => tag.slug) ?? [],
      });
    } finally {
      setState('loading', false);
    }
  };

  onMount(() => void load());

  const ready = () => Boolean(state.existing) && !state.loading && !state.busy;
  const canArchive = () =>
    Boolean(state.existing && canArchiveResource(actor()) && isResourceArchivable(state.existing));
  const canUnarchive = () =>
    Boolean(state.existing && canUnarchiveResource(actor()) && isResourceUnarchivable(state.existing));
  const canDelete = () => Boolean(state.existing && canDeleteResource(actor()));
  const canSaveNow = () => canManageResources(actor()) && ready();
  const canArchiveNow = () => canArchive() && ready();
  const canUnarchiveNow = () => canUnarchive() && ready();
  const canDeleteNow = () => canDelete() && ready();

  const save = async (formValue: ResourceSubmitData) => {
    if (!canSaveNow()) return false;
    setState('error', null);

    setState('busy', true);
    try {
      const result = await updateResource(id(), {
        title: formValue.title.trim(),
        description: formValue.description.trim(),
        url: formValue.url.trim(),
        tagSlugs: formValue.tags ?? [],
      });
      if (result.kind === 'failure') {
        notifyError(result.code);
        return false;
      }
      notifySuccess(result.code);
      await load();
      return true;
    } finally {
      setState('busy', false);
    }
  };

  const runLifecycle = async (operation: () => ReturnType<typeof archiveResource>) => {
    if (!ready()) return false;
    setState('busy', true);
    try {
      const result = await operation();
      if (result.kind === 'failure') {
        notifyError(result.code);
        return false;
      }
      notifySuccess(result.code);
      await load();
      return true;
    } finally {
      setState('busy', false);
    }
  };

  const archive = () => (canArchiveNow() ? runLifecycle(() => archiveResource(id())) : Promise.resolve(false));
  const unarchive = () => (canUnarchiveNow() ? runLifecycle(() => unarchiveResource(id())) : Promise.resolve(false));

  const remove = async () => {
    if (!canDeleteNow()) return false;
    setState('busy', true);
    try {
      const result = await deleteResource(id());
      if (result.kind === 'failure') {
        notifyError(result.code);
        return false;
      }
      notifySuccess(result.code);
      redirectTo('/panel/resources');
      return true;
    } finally {
      setState('busy', false);
    }
  };

  return {
    loading: () => state.loading,
    busy: () => state.busy,
    existing: () => state.existing,
    formDefaults: () => state.formDefaults,
    error: () => state.error,
    confirmDelete: () => state.confirmDelete,
    setConfirmDelete: (value: boolean) => setState('confirmDelete', value),
    canArchive,
    canUnarchive,
    canDelete,
    canSaveNow,
    canArchiveNow,
    canUnarchiveNow,
    canDeleteNow,
    save,
    archive,
    unarchive,
    remove,
  };
}
