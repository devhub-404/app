import { ProjectsApi } from '@/features/project/api/project.api.ts';
import { persistLocalEntities, readLocalEntities } from '@/shared/storage/local-database';
import type { Project } from '@/features/project/types/project.type.ts';
import { isClientAccessAllowed } from '@/features/auth/public/access';
import { canManageProjects } from '@/features/project/access/project.access.ts';

/** Account-owned list with replaceable local fallback. */
export async function listMyProjects(query?: Parameters<typeof ProjectsApi.mine>[0]) {
  try {
    const result = await ProjectsApi.mine(query);
    if (!result.error) {
      void persistLocalEntities('projects', result.data?.data?.items ?? []);
      return result;
    }
    const cached = await readLocalEntities<Project>('projects');
    if (!cached.length) return result;
    return {
      data: { data: { items: cached, page: 1, pageSize: cached.length, total: cached.length } },
      error: result.error,
    };
  } catch {
    const cached = await readLocalEntities<Project>('projects');
    return {
      data: { data: { items: cached, page: 1, pageSize: cached.length, total: cached.length } },
      error: { code: 'NETWORK_REQUEST_FAILED' },
    };
  }
}

export async function listProjectsForManagement(query?: Parameters<typeof ProjectsApi.listForManagement>[0]) {
  if (!isClientAccessAllowed(canManageProjects))
    return { data: { data: { items: [], page: 1, pageSize: 0, total: 0 } } };
  return ProjectsApi.listForManagement(query);
}
export function getProjectQuery(slug: string, client?: import('@/shared/api').ApiClient) {
  return ProjectsApi.get(slug, client);
}
export function getProjectByIdQuery(id: string) {
  return ProjectsApi.getById(id);
}
export function listProjectsQuery(
  query?: Parameters<typeof ProjectsApi.list>[0],
  client?: import('@/shared/api').ApiClient,
) {
  return ProjectsApi.list(query, client);
}
export function createProject(payload: Parameters<typeof ProjectsApi.create>[0]) {
  return ProjectsApi.create(payload);
}
export function updateProject(id: string, payload: Parameters<typeof ProjectsApi.update>[1]) {
  return ProjectsApi.update(id, payload);
}
export function publishProject(id: string) {
  return ProjectsApi.publish(id);
}
export function archiveProject(id: string) {
  return ProjectsApi.archive(id);
}
export function unarchiveProject(id: string) {
  return ProjectsApi.unarchive(id);
}
export function deleteProject(id: string) {
  return ProjectsApi.remove(id);
}
