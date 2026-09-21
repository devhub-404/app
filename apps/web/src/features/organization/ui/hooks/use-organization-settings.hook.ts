import { onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import type {
  OrganizationMembership,
  OrganizationRole,
  UpdateOrganizationInput,
  MyOrganization,
} from '@/features/organization/types/organization.type.ts';
import { useI18n } from '@/features/organization/i18n';
import {
  addOrganizationMemberCommand,
  archiveOrganizationCommand,
  changeOrganizationMemberRoleCommand,
  deleteOrganizationCommand,
  leaveOrganizationCommand,
  listMyOrganizationsQuery,
  listOrganizationMembersQuery,
  removeOrganizationMemberCommand,
  unarchiveOrganizationCommand,
  updateOrganizationCommand,
} from '@/features/organization/actions/organization.action.ts';
import {
  canArchiveOrganization,
  canDeleteOrganization,
  canManageOrganization,
  canManageOrganizationMemberships,
  canUnarchiveOrganization,
} from '@/features/organization/access/organization.access.ts';
import type { Actor } from '@/features/auth/public';

export function useOrganizationSettings(slug: () => string) {
  const { t } = useI18n();
  const [state, setState] = createStore({
    organization: null as MyOrganization | null,
    members: [] as OrganizationMembership[],
    loading: true,
    error: '',
    adding: false,
    saving: false,
    lifecycleBusy: false,
    pendingAccountId: null as string | null,
  });

  const load = async () => {
    setState('loading', true);
    const mine = await listMyOrganizationsQuery();
    if (!mine.ok) {
      setState({
        organization: null,
        members: [],
        error: t('organizationsettings.youNotCanManageThisOrganization'),
        loading: false,
      });
      return;
    }
    const current = mine.data.find((item) => item.slug === slug());
    if (!current) {
      setState({
        organization: null,
        members: [],
        error: t('organizationsettings.youNotCanManageThisOrganization'),
        loading: false,
      });
      return;
    }
    const members = await listOrganizationMembersQuery(current.id);
    setState({
      organization: current,
      members: members.ok ? members.data : [],
      error: members.ok ? '' : t('organizationsettings.youNotCanManageThisOrganization'),
      loading: false,
    });
  };

  onMount(() => void load());

  const actorFor = (current: MyOrganization): Actor => ({
    accountId: null,
    role: null,
    organizationIds: canManageOrganization(current.membershipRole) ? [current.id] : [],
    ownerOrganizationIds: current.membershipRole === 'owner' ? [current.id] : [],
  });

  const updateDetails = async (input: UpdateOrganizationInput) => {
    const current = state.organization;
    if (!current || state.saving || !canManageOrganization(current.membershipRole)) return false;
    setState({ saving: true, error: '' });
    const result = await updateOrganizationCommand(current.id, input);
    if (!result.ok) setState('error', t('organizationsettings.couldNotUpdate'));
    else await load();
    setState('saving', false);
    return result.ok;
  };

  const changeLifecycle = async (action: 'archive' | 'unarchive') => {
    const current = state.organization;
    if (!current || state.lifecycleBusy) return false;
    const actor = actorFor(current);
    if (
      action === 'archive' ? !canArchiveOrganization(current.id, actor) : !canUnarchiveOrganization(current.id, actor)
    )
      return false;

    setState({ lifecycleBusy: true, error: '' });
    const result =
      action === 'archive'
        ? await archiveOrganizationCommand(current.id)
        : await unarchiveOrganizationCommand(current.id);
    if (!result.ok) setState('error', t('organizationsettings.couldNotChangeStatus'));
    else await load();
    setState('lifecycleBusy', false);
    return result.ok;
  };

  const deleteCurrent = async () => {
    const current = state.organization;
    if (!current || state.lifecycleBusy || !canDeleteOrganization(current.id, actorFor(current))) return false;
    setState({ lifecycleBusy: true, error: '' });
    const result = await deleteOrganizationCommand(current.id);
    if (!result.ok) setState('error', t('organizationsettings.couldNotDelete'));
    setState('lifecycleBusy', false);
    return result.ok;
  };

  const leaveCurrent = async () => {
    const current = state.organization;
    if (!current || state.lifecycleBusy) return false;
    setState({ lifecycleBusy: true, error: '' });
    const result = await leaveOrganizationCommand(current.id);
    if (!result.ok) setState('error', t('organizationsettings.couldNotLeave'));
    setState('lifecycleBusy', false);
    return result.ok;
  };

  const add = async (accountId: string, role: OrganizationRole) => {
    const current = state.organization;
    if (!current || state.adding || !canManageOrganizationMemberships(current.id, actorFor(current))) return false;
    setState({ adding: true, error: '' });
    const result = await addOrganizationMemberCommand(current.id, accountId, role);
    if (!result.ok) setState('error', t('organizationsettings.couldNotAddMemberVerifyAccountIdPermissions'));
    else await load();
    setState('adding', false);
    return result.ok;
  };

  const changeRole = async (membership: OrganizationMembership, role: OrganizationRole) => {
    const current = state.organization;
    if (!current || state.pendingAccountId || !canManageOrganizationMemberships(current.id, actorFor(current))) return;
    setState({ pendingAccountId: membership.accountId, error: '' });
    const result = await changeOrganizationMemberRoleCommand(current.id, membership.accountId, role);
    if (!result.ok) setState('error', t('organizationsettings.couldNotChangeRoleLastOwnerNotCanBe'));
    else await load();
    setState('pendingAccountId', null);
  };

  const remove = async (membership: OrganizationMembership) => {
    const current = state.organization;
    if (!current || state.pendingAccountId || !canManageOrganizationMemberships(current.id, actorFor(current))) return;
    setState({ pendingAccountId: membership.accountId, error: '' });
    const result = await removeOrganizationMemberCommand(current.id, membership.accountId);
    if (!result.ok) setState('error', t('organizationsettings.couldNotRemoveMemberOrganizationMustPreserveLeastOwner'));
    else await load();
    setState('pendingAccountId', null);
  };

  return {
    organization: () => state.organization,
    members: () => state.members,
    loading: () => state.loading,
    error: () => state.error,
    adding: () => state.adding,
    saving: () => state.saving,
    lifecycleBusy: () => state.lifecycleBusy,
    pendingAccountId: () => state.pendingAccountId,
    updateDetails,
    changeLifecycle,
    deleteCurrent,
    leaveCurrent,
    add,
    changeRole,
    remove,
    load,
  };
}
