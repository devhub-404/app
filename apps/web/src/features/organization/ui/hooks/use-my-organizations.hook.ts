import { onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import { listMyOrganizationsQuery } from '@/features/organization/actions/organization.action.ts';
import type { Organization } from '@/features/organization/types/organization.type.ts';

export function useMyOrganizations() {
  const [state, setState] = createStore({
    items: [] as Organization[],
    loading: true,
    failed: false,
  });

  const reload = async () => {
    setState({ loading: true, failed: false });
    const result = await listMyOrganizationsQuery();
    if (!result.ok) {
      setState({ items: [], loading: false, failed: true });
      return;
    }
    setState({ items: result.data, loading: false, failed: false });
  };

  onMount(() => void reload());

  return {
    items: () => state.items,
    loading: () => state.loading,
    failed: () => state.failed,
    load: reload,
  };
}
