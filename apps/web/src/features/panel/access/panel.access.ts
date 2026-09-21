import { routes } from '../../../shared/navigation/routes.ts';

export type PanelRole = 'curator' | 'moderator' | 'admin';
export type PanelCapability =
  | 'articles'
  | 'news'
  | 'news-suggestions'
  | 'resources'
  | 'resource-suggestions'
  | 'events'
  | 'event-suggestions'
  | 'questions'
  | 'answers'
  | 'projects'
  | 'jobs'
  | 'job-suggestions'
  | 'feedback'
  | 'comments'
  | 'reports'
  | 'hidden-content'
  | 'inventory'
  | 'standing'
  | 'restrictions'
  | 'sanctions'
  | 'deletion'
  | 'roles'
  | 'tags'
  | 'aliases'
  | 'governance'
  | 'administrative-audit'
  | 'operational-status';

/**
 * Client visibility policy for panel surfaces.
 *
 * This mirrors the domain responsibilities documented by each owner; it does
 * not grant authority. The backend remains authoritative for every operation.
 * Curator owns editorial work for News, Event, Job and ExternalResource;
 * Moderator owns moderation; Administrator has authority over every platform
 * capability while the matrix documents the specialized role ownership.
 */
export const panelAccess: Readonly<Record<PanelCapability, readonly PanelRole[]>> = {
  articles: ['moderator', 'admin'],
  news: ['curator', 'moderator', 'admin'],
  'news-suggestions': ['curator', 'admin'],
  resources: ['curator', 'moderator', 'admin'],
  'resource-suggestions': ['curator', 'admin'],
  events: ['curator', 'moderator', 'admin'],
  'event-suggestions': ['curator', 'admin'],
  questions: ['moderator', 'admin'],
  answers: ['moderator', 'admin'],
  projects: ['moderator', 'admin'],
  jobs: ['curator', 'moderator', 'admin'],
  'job-suggestions': ['curator', 'admin'],
  feedback: ['moderator', 'admin'],
  comments: ['moderator', 'admin'],
  reports: ['moderator', 'admin'],
  'hidden-content': ['moderator', 'admin'],
  inventory: ['admin'],
  standing: ['moderator', 'admin'],
  restrictions: ['moderator', 'admin'],
  sanctions: ['moderator', 'admin'],
  deletion: ['admin'],
  roles: ['admin'],
  tags: ['curator', 'admin'],
  aliases: ['admin'],
  governance: ['admin'],
  'administrative-audit': ['admin'],
  'operational-status': ['admin'],
};

const panelPaths: ReadonlyArray<readonly [string, PanelCapability]> = [
  [routes.panel.articles, 'articles'],
  [routes.panel.newsSuggestions, 'news-suggestions'],
  [routes.panel.news, 'news'],
  [routes.panel.resourceSuggestions, 'resource-suggestions'],
  [routes.panel.resources, 'resources'],
  [routes.panel.eventSuggestions, 'event-suggestions'],
  [routes.panel.events, 'events'],
  [routes.panel.questions, 'questions'],
  [routes.panel.projects, 'projects'],
  [routes.panel.jobSuggestions, 'job-suggestions'],
  [routes.panel.jobs, 'jobs'],
  [routes.panel.feedback, 'feedback'],
  [routes.panel.comments, 'comments'],
  [routes.panel.reports, 'reports'],
  [routes.panel.hidden, 'hidden-content'],
  [routes.panel.status, 'operational-status'],
  [routes.panel.users, 'inventory'],
  [routes.panel.roles, 'roles'],
  [routes.panel.tags, 'tags'],
];

export const privilegedPanelRoles: readonly PanelRole[] = ['curator', 'moderator', 'admin'];

export function isPanelRole(role: string | null | undefined): role is PanelRole {
  return role === 'curator' || role === 'moderator' || role === 'admin';
}

export function hasAnyPanelRole(role: string | null | undefined): boolean {
  return isPanelRole(role);
}

export function canAccessPanelCapability(role: string | null | undefined, capability: PanelCapability): boolean {
  return isPanelRole(role) && panelAccess[capability].includes(role);
}

export function panelCapabilityForPath(pathname: string): PanelCapability | null {
  const match = panelPaths
    .filter(([path]) => pathname === path || pathname.startsWith(`${path}/`))
    .sort(([a], [b]) => b.length - a.length)[0];
  return match?.[1] ?? null;
}

export function panelRolesForPath(pathname: string): readonly PanelRole[] | null {
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/';
  if (normalizedPathname !== '/panel' && !normalizedPathname.startsWith('/panel/')) return null;
  if (normalizedPathname === '/panel') return privilegedPanelRoles;

  const capability = panelCapabilityForPath(normalizedPathname);
  return capability === null ? [] : panelAccess[capability];
}

export function canAccessPanelPath(pathname: string, role: string | null | undefined): boolean {
  const roles = panelRolesForPath(pathname);
  return roles === null || (isPanelRole(role) && roles.includes(role));
}
