import type { PanelNavigationItem, PanelNavigationSection } from './panel-navigation';
import { panelSections } from './panel-navigation';
import {
  canAccessPanelCapability,
  canAccessPanelPath,
  hasAnyPanelRole,
  isPanelRole,
  panelAccess,
  panelCapabilityForPath,
  privilegedPanelRoles,
  type PanelCapability,
  type PanelRole,
} from '@/features/panel/access/panel.access.ts';

export function canAccessPanelItem(item: Pick<PanelNavigationItem, 'id'>, role: string | null | undefined): boolean {
  return canAccessPanelCapability(role, item.id);
}

export function firstAvailableItem(
  section: PanelNavigationSection,
  role: string | null | undefined,
): PanelNavigationItem | undefined {
  return section.items.find((item) => canAccessPanelItem(item, role));
}

export function canSeeModerationTab(role: string | null | undefined): boolean {
  return canAccessPanelCapability(role, 'hidden-content');
}

export function canSeeRolesTab(role: string | null | undefined): boolean {
  return canAccessPanelCapability(role, 'roles');
}

export {
  canAccessPanelCapability,
  canAccessPanelPath,
  hasAnyPanelRole,
  isPanelRole,
  panelAccess,
  panelCapabilityForPath,
  panelSections,
  privilegedPanelRoles,
};
export type { PanelCapability, PanelRole };
export type {
  PanelNavigationItem,
  PanelNavigationSection,
  PanelNavigationSectionId as PanelArea,
} from './panel-navigation';
export { panelSectionForItem } from './panel-navigation';
