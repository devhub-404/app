import { createMemo, createSignal, onMount } from 'solid-js';
import { useAccount } from '@/features/account/public/account-state';
import { anonymousActor, type Actor } from '@/features/auth/public/access';
import { listMyOrganizationsQuery } from '@/features/organization/actions/organization.action.ts';
import type { MyOrganization } from '@/features/organization/types/organization.type.ts';

/** Authenticated actor enriched with organizations the account can manage. */
export function useManagedActor() {
  const { state: account, bootstrapAccount } = useAccount();
  const [organizationIds, setOrganizationIds] = createSignal<string[]>([]);
  const [ownerOrganizationIds, setOwnerOrganizationIds] = createSignal<string[]>([]);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    if (account().status === 'idle') await bootstrapAccount().catch(() => undefined);
    const details = account().details;
    if (!details?.account.id) {
      setLoading(false);
      return;
    }
    try {
      const response = await listMyOrganizationsQuery();
      const organizations: MyOrganization[] = response.ok ? response.data : [];
      setOrganizationIds(
        organizations
          .filter(({ membershipRole }) => membershipRole === 'owner' || membershipRole === 'admin')
          .map(({ id }) => id),
      );
      setOwnerOrganizationIds(
        organizations.filter(({ membershipRole }) => membershipRole === 'owner').map(({ id }) => id),
      );
    } catch {
      // Organization access is optional for the managed-actor projection.
      // Keep the account actor usable when the organization service is unavailable.
    } finally {
      setLoading(false);
    }
  });

  const actor = createMemo<Actor>(() => {
    const details = account().details;
    if (!details) return anonymousActor;
    return {
      accountId: details.account.id,
      role: details.role,
      organizationIds: organizationIds(),
      ownerOrganizationIds: ownerOrganizationIds(),
    };
  });

  return { actor, loading };
}
