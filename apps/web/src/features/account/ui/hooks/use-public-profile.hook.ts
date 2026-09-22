import { createMemo, createSignal, onMount } from "solid-js";
import { useAppActor as useAuthSession } from "@/app/session/public";
import { getProfileByUsername } from "@/features/account/actions/profile.action.ts";
import type { PublicProfileDTO } from "@/features/account/types/profile.type.ts";
import {
  profileTabs,
  type ProfileContributionType,
  type ProfileTab,
} from "@/features/account/ui/components/profile/public/profile-contributions.component.ts";

type Props = {
  username: string;
  initialProfile?: PublicProfileDTO | null;
  initialError?: boolean;
};

export function usePublicProfile(props: Props) {
  const { session } = useAuthSession();
  const [profile, setProfile] = createSignal<PublicProfileDTO | null>(
    props.initialProfile ?? null,
  );
  const [loading, setLoading] = createSignal(
    props.initialProfile === undefined,
  );
  const [error, setError] = createSignal(Boolean(props.initialError));
  const [selectedTab, setSelectedTab] = createSignal<ProfileTab | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(false);
    try {
      setProfile(
        await getProfileByUsername(String(props.username ?? "").trim()),
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    if (props.initialProfile === undefined) void reload();
  });

  const canEdit = createMemo(() => {
    const state = session();
    const data = profile();
    return Boolean(
      data &&
      state.status === "authenticated" &&
      state.me.profile?.username === data.username,
    );
  });

  const contributions = createMemo(() => profile()?.contributions ?? []);
  const filters = createMemo(() => {
    const counts = new Map<ProfileContributionType, number>();
    for (const item of contributions())
      counts.set(item.type, (counts.get(item.type) ?? 0) + 1);
    return profileTabs.map((tab) => ({
      ...tab,
      count: tab.types.reduce(
        (total, type) => total + (counts.get(type) ?? 0),
        0,
      ),
    }));
  });

  const activeTab = createMemo(() => selectedTab() ?? filters()[0]?.id ?? null);
  const visibleContributions = createMemo(() => {
    const tab = profileTabs.find((item) => item.id === activeTab());
    return tab
      ? contributions().filter((item) => tab.types.includes(item.type))
      : [];
  });
  const interactions = createMemo(() =>
    contributions()
      .filter((item) => item.type === "question" || item.type === "answer")
      .slice(0, 4),
  );

  return {
    profile,
    loading,
    error,
    reload,
    canEdit,
    contributions,
    filters,
    activeTab,
    setSelectedTab,
    visibleContributions,
    interactions,
  };
}
