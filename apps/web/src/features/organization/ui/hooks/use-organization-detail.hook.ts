import { createEffect, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import {
  getOrganizationQuery,
  listOrganizationMembersQuery,
} from "@/features/organization/actions/organization.action.ts";
import type {
  Organization,
  OrganizationMembership,
} from "@/features/organization/types/organization.type.ts";
import { listJobsByOrganization } from "@/features/job/public";
import { useAppActor as useAuthSession } from "@/app/session/public";
import {
  getRouteScope,
  isCurrentRouteScope,
} from "@/shared/runtime/route-scope";

export type OrganizationContentItem = {
  id: string;
  title: string;
  slug?: string;
};

export function useOrganizationDetail(
  slug: () => string,
  initialOrganization?: Organization | null,
) {
  const { authenticated } = useAuthSession();
  const [state, setState] = createStore({
    organization: (initialOrganization ?? null) as Organization | null,
    members: [] as OrganizationMembership[],
    jobs: [] as OrganizationContentItem[],
    loading: initialOrganization === undefined,
    failed: false,
  });

  const loadRelated = async (organizationId: string) => {
    const routeScope = getRouteScope();
    try {
      const jobs = await listJobsByOrganization(organizationId, 6, {
        signal: routeScope.signal,
      });
      if (!isCurrentRouteScope(routeScope)) return;
      setState("jobs", jobs);
    } catch {
      if (!isCurrentRouteScope(routeScope)) return;
      setState({ jobs: [], failed: true });
    } finally {
      if (isCurrentRouteScope(routeScope)) setState("loading", false);
    }
  };

  const load = async () => {
    const routeScope = getRouteScope();
    setState({ loading: true, failed: false });
    try {
      const organizationResult = await getOrganizationQuery(slug(), {
        signal: routeScope.signal,
      });
      if (!organizationResult.ok) throw new Error(organizationResult.code);
      const organization = organizationResult.data;
      if (!isCurrentRouteScope(routeScope)) return;
      setState("organization", organization);
      await loadRelated(organization.id);
    } catch {
      if (!isCurrentRouteScope(routeScope)) return;
      setState({ organization: null, members: [], jobs: [], failed: true });
    } finally {
      if (isCurrentRouteScope(routeScope)) setState("loading", false);
    }
  };

  const loadMembers = async (organizationId: string) => {
    const routeScope = getRouteScope();
    if (!authenticated()) {
      setState("members", []);
      return;
    }
    try {
      const result = await listOrganizationMembersQuery(organizationId, {
        signal: routeScope.signal,
      });
      if (isCurrentRouteScope(routeScope))
        setState("members", result.ok ? result.data : []);
    } catch {
      if (isCurrentRouteScope(routeScope)) setState("members", []);
    }
  };

  onMount(() => {
    if (initialOrganization) void loadRelated(initialOrganization.id);
    else if (initialOrganization === undefined) void load();
  });
  createEffect(() => {
    const organization = state.organization;
    authenticated();
    if (organization) void loadMembers(organization.id);
    else setState("members", []);
  });

  return {
    organization: () => state.organization,
    members: () => state.members,
    jobs: () => state.jobs,
    loading: () => state.loading,
    failed: () => state.failed,
    load,
  };
}
