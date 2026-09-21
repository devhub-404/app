import { For, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Eye, FolderPlus, Pencil } from 'lucide-solid';
import { listMyProjects } from '@/features/project/actions/project.action.ts';
import { isProjectPublic } from '@/features/project/domain/project.domain.ts';
import type { Project } from '@/features/project/types/project.type.ts';
import { routes } from '@/shared/navigation/routes';
import { formatPublicDate } from '@/shared/utils/format-public-date.util.ts';

import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/project/i18n';
import EmptyState from '@/shared/ui/components/feedback/empty-state.component.tsx';
import StatusBadge from '@/shared/ui/components/feedback/status-badge.component.tsx';
import ListPanelRows from '@/shared/ui/components/surfaces/list-panel-rows.component.tsx';
import ManagementListPanel from '@/shared/ui/components/surfaces/management-list-panel.component.tsx';
import ManagementListItem from '@/shared/ui/components/surfaces/management-list-item.component.tsx';
const statusTone: Record<Project['status'], 'neutral' | 'success' | 'accent'> = {
  draft: 'neutral',
  published: 'success',
  archived: 'accent',
};

function ProjectManagement() {
  const { t, locale } = useI18n();
  const statusLabel: Record<Project['status'], string> = {
    draft: t('projectmanagement.draft'),
    published: t('projectmanagement.published'),
    archived: t('projectmanagement.archived'),
  };
  const [state, setState] = createStore({ items: [] as Project[], loading: true, error: '' });

  const load = async () => {
    setState({ loading: true, error: '' });
    try {
      const result = await listMyProjects({ page: 1, pageSize: 100 });
      if (result.error) setState('error', t('projectmanagement.couldNotLoadProjectsNow'));
      else setState('items', result.data?.data?.items ?? []);
    } catch {
      setState('error', t('projectmanagement.couldNotLoadProjectsNow'));
    } finally {
      setState('loading', false);
    }
  };

  onMount(() => void load());

  return (
    <ManagementListPanel
      headingId="projects-management-heading"
      title={t('projectmanagement.projects')}
      description={t('projectmanagement.trackStatusOpenManagementEachWork')}
      action={
        <a href={routes.projectNew} class="action action-primary">
          <FolderPlus class="size-4" /> {t('projectmanagement.createProject')}
        </a>
      }
      error={state.error}
      loading={state.loading}
      loadingLabel={t('projectmanagement.loadingProjects')}
    >
      <ListPanelRows>
        <For
          each={state.items}
          fallback={
            <EmptyState>
              <p class="text-emphasis">{t('projectmanagement.youStillNotAddedProjects')}</p>
              <p class="text-muted-body mx-auto mt-2 max-w-md">
                {t('projectmanagement.presentWorkReferenceTechnicalOrExperimentRelevantProfile')}
              </p>
              <div class="mt-5">
                <a href={routes.projectNew} class="action action-primary">
                  <FolderPlus class="size-4" /> {t('projectmanagement.createFirstProject')}
                </a>
              </div>
            </EmptyState>
          }
        >
          {(project) => (
            <ManagementListItem
              status={<StatusBadge status={statusTone[project.status]}>{statusLabel[project.status]}</StatusBadge>}
              meta={
                <>
                  <span class="text-xs text-content-muted">
                    {t('projectmanagement.updated')} {formatPublicDate(project.updatedAt, locale())}
                  </span>
                  <Show when={project.hiddenAt}>
                    <StatusBadge status="danger">{t('editproject.hiddenByModeration')}</StatusBadge>
                  </Show>
                </>
              }
              title={project.title}
              description={
                <p class="text-caption mt-2 line-clamp-1">
                  {project.summary}
                </p>
              }
              actions={
                <>
                  <Show when={isProjectPublic(project)}>
                    <a href={routes.project(project.slug)} class="action action-secondary">
                      <Eye class="size-3.5" /> {t('projectmanagement.view')}
                    </a>
                  </Show>
                  <a href={routes.account.project(project.id)} class="action action-secondary">
                    <Pencil class="size-3.5" /> {t('projectmanagement.edit')}
                  </a>
                </>
              }
            />
          )}
        </For>
      </ListPanelRows>
    </ManagementListPanel>
  );
}

export default withLocale(ProjectManagement);
