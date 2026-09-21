import { createEffect, createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';
import {
  archiveProject,
  deleteProject,
  getProjectByIdQuery,
  publishProject,
  unarchiveProject,
  updateProject,
} from '@/features/project/actions/project.action.ts';
import type { Project } from '@/features/project/types/project.type.ts';
import {
  canArchiveProject,
  canDeleteProject,
  canEditProject,
  canPublishProject,
  canUnarchiveProject,
} from '@/features/project/access/project.access.ts';
import {
  isProjectArchivable,
  isProjectPublishable,
  isProjectUnarchivable,
} from '@/features/project/domain/project.domain.ts';
import { useManagedActor } from '@/features/organization/public';
import { routes } from '@/shared/navigation/routes';
import { redirectTo } from '@/shared/utils/redirect.util.ts';
import { useI18n } from '@/features/project/i18n';
import type { ProjectFormInput } from '@/features/project/ui/schemas/forms.schema.ts';

export function useEditProject(id: string) {
  const { t } = useI18n();
  const [state, setState] = createStore({ project: null as Project | null, loading: true, busy: false, error: '' });
  const { actor, loading: actorLoading } = useManagedActor();
  let loaded = false;

  createEffect(() => {
    if (loaded || actorLoading()) return;
    loaded = true;
    void (async () => {
      const result = await getProjectByIdQuery(id);
      const candidate = result.data?.data ?? null;
      setState({ project: candidate && canEditProject(candidate, actor()) ? candidate : null, loading: false });
    })();
  });

  const update = <K extends keyof Project>(field: K, value: Project[K]) => {
    const current = state.project;
    if (current) setState('project', { ...current, [field]: value });
  };

  const save = async (formValue?: ProjectFormInput) => {
    const current = state.project;
    if (!current || state.busy || !canEditProject(current, actor())) return;
    setState({ busy: true, error: '' });
    try {
      const value = formValue ?? {
        title: current.title,
        summary: current.summary,
        description: current.description,
        projectUrl: current.projectUrl,
        repositoryUrl: current.repositoryUrl,
        tagSlugs: current.tagSlugs,
      };
      const result = await updateProject(current.id, {
        ...value,
        title: value.title.trim(),
        summary: value.summary.trim(),
        description: value.description.trim(),
        projectUrl: value.projectUrl?.trim() || null,
        repositoryUrl: value.repositoryUrl?.trim() || null,
        tagSlugs: value.tagSlugs ?? [],
      });
      if (result.error) setState('error', t('editproject.couldNotUpdateProject'));
      else redirectTo(routes.account.projects);
    } finally {
      setState('busy', false);
    }
  };

  const changeLifecycle = async (action: 'publish' | 'archive' | 'unarchive' | 'delete') => {
    const current = state.project;
    if (!current || state.busy) return;
    const allowed =
      action === 'publish'
        ? canPublishProject(current, actor()) && isProjectPublishable(current)
        : action === 'archive'
          ? canArchiveProject(current, actor()) && isProjectArchivable(current)
          : action === 'unarchive'
            ? canUnarchiveProject(current, actor()) && isProjectUnarchivable(current)
            : canDeleteProject(current, actor());
    if (!allowed) return;
    setState({ busy: true, error: '' });
    try {
      const result =
        action === 'publish'
          ? await publishProject(current.id)
          : action === 'archive'
            ? await archiveProject(current.id)
            : action === 'unarchive'
              ? await unarchiveProject(current.id)
              : await deleteProject(current.id);
      if (result.error) setState('error', t('editproject.changeNotCanBeAppliedUpdateStatusProjecttryAgain'));
      else if (action === 'delete') redirectTo(routes.account.projects);
      else if (result.data?.data) setState('project', result.data.data);
    } finally {
      setState('busy', false);
    }
  };

  return {
    project: () => state.project,
    loading: () => state.loading,
    busy: () => state.busy,
    error: () => state.error,
    update,
    save,
    changeLifecycle,
    canPublish: createMemo(() =>
      Boolean(state.project && canPublishProject(state.project, actor()) && isProjectPublishable(state.project)),
    ),
    canArchive: createMemo(() =>
      Boolean(state.project && canArchiveProject(state.project, actor()) && isProjectArchivable(state.project)),
    ),
    canUnarchive: createMemo(() =>
      Boolean(state.project && canUnarchiveProject(state.project, actor()) && isProjectUnarchivable(state.project)),
    ),
    canDelete: createMemo(() => Boolean(state.project && canDeleteProject(state.project, actor()))),
  };
}
