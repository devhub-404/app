import { routes } from '@/shared/navigation/routes';
import type { TranslationKey } from '../../i18n';
import type { PanelCapability } from './panel-access';

export type PanelNavigationSectionId = 'content' | 'moderation' | 'accounts' | 'taxonomy' | 'operations';
export type PanelNavigationItem = { id: PanelCapability; labelKey: TranslationKey; href: string };
export type PanelNavigationSection = {
  id: PanelNavigationSectionId;
  labelKey: TranslationKey;
  items: PanelNavigationItem[];
};

export const panelSections: readonly PanelNavigationSection[] = [
  {
    id: 'content',
    labelKey: 'panelNav.content',
    items: [
      { id: 'articles', labelKey: 'panelNav.articles', href: routes.panel.articles },
      { id: 'news', labelKey: 'panelNav.news', href: routes.panel.news },
      { id: 'news-suggestions', labelKey: 'panelNav.newsSuggestions', href: routes.panel.newsSuggestions },
      { id: 'resources', labelKey: 'panelNav.resources', href: routes.panel.resources },
      { id: 'resource-suggestions', labelKey: 'panelNav.resourceSuggestions', href: routes.panel.resourceSuggestions },
      { id: 'events', labelKey: 'panelNav.events', href: routes.panel.events },
      { id: 'event-suggestions', labelKey: 'panelNav.eventSuggestions', href: routes.panel.eventSuggestions },
      { id: 'questions', labelKey: 'panelNav.questions', href: routes.panel.questions },
      { id: 'projects', labelKey: 'panelNav.projects', href: routes.panel.projects },
      { id: 'jobs', labelKey: 'panelNav.jobs', href: routes.panel.jobs },
      { id: 'job-suggestions', labelKey: 'panelNav.jobSuggestions', href: routes.panel.jobSuggestions },
      { id: 'comments', labelKey: 'panelNav.comments', href: routes.panel.comments },
      { id: 'feedback', labelKey: 'panelNav.feedback', href: routes.panel.feedback },
    ],
  },
  {
    id: 'moderation',
    labelKey: 'panelNav.moderation',
    items: [
      { id: 'reports', labelKey: 'panelNav.reports', href: routes.panel.reports },
      { id: 'hidden-content', labelKey: 'panelNav.hiddenContent', href: routes.panel.hidden },
    ],
  },
  {
    id: 'accounts',
    labelKey: 'panelNav.accounts',
    items: [
      { id: 'inventory', labelKey: 'panelNav.inventory', href: routes.panel.users },
      { id: 'roles', labelKey: 'panelNav.roles', href: routes.panel.roles },
    ],
  },
  {
    id: 'taxonomy',
    labelKey: 'panelNav.taxonomy',
    items: [
      { id: 'tags', labelKey: 'panelNav.tags', href: routes.panel.tags },
      { id: 'aliases', labelKey: 'panelNav.aliases', href: `${routes.panel.tags}#aliases` },
      { id: 'governance', labelKey: 'panelNav.governance', href: `${routes.panel.tags}#governance` },
    ],
  },
  {
    id: 'operations',
    labelKey: 'panelNav.operations',
    items: [{ id: 'operational-status', labelKey: 'panelNav.operationalStatus', href: routes.panel.status }],
  },
] as const;

export function panelSectionForItem(itemId: string): PanelNavigationSectionId | 'overview' {
  return panelSections.find((section) => section.items.some((item) => item.id === itemId))?.id ?? 'overview';
}
