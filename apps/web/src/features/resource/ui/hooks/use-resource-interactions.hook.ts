import { createEffect, type Accessor } from "solid-js";
import { createStore } from "solid-js/store";
import { useStore } from "@nanostores/solid";
import type { ResourceItem } from "@/features/resource/types/resource.type.ts";
import { useAuthActor as useAuthSession } from "@/features/auth/public";
import {
  $personalStateScope,
  getPersonalContentStates,
  refreshPersonalState,
} from "@/shared/runtime/personal-state";
import {
  removeBookmark,
  saveBookmark,
} from "@/shared/interactions/bookmark/public";
import { setVote } from "@/shared/interactions/vote/public";
import { redirectTo } from "@/shared/utils/redirect.util.ts";
import { getReturnToFromLocation } from "@/shared/utils/location.util.ts";
import { useI18n } from "@/features/resource/i18n";
import { shareOrCopy } from "@/shared/ui/interactions/share-or-copy";

export type ResourcePersonalState = { voted: boolean; bookmarked: boolean };

export function useResourceInteractions(items: Accessor<ResourceItem[]>) {
  const { t } = useI18n();
  const auth = useAuthSession();
  const scope = useStore($personalStateScope);
  const [state, setState] = createStore({
    personal: {} as Record<string, ResourcePersonalState>,
    personalLoading: false,
    pending: {} as Record<string, boolean>,
    messages: {} as Record<string, string>,
    voteCounts: {} as Record<string, number>,
  });

  createEffect(() => {
    const currentItems = items();
    const revision = scope().revision;
    const authenticated = auth.authenticated();
    const ids = currentItems.map((item) => item.id);

    const nextVoteCounts = { ...state.voteCounts };
    for (const item of currentItems) {
      if (nextVoteCounts[item.id] === undefined)
        nextVoteCounts[item.id] = item.votes;
    }
    setState({
      voteCounts: nextVoteCounts,
      personal: {},
      personalLoading: authenticated && ids.length > 0,
    });
    if (!authenticated || ids.length === 0) return;

    void getPersonalContentStates(ids)
      .then((states) => {
        if (revision === scope().revision) {
          setState("personal", states);
        }
      })
      .catch(() => {})
      .finally(() => {
        setState("personalLoading", false);
      });
  });

  const requireAccount = () => {
    if (auth.authenticated()) return true;
    redirectTo(
      `/login?redirect=${encodeURIComponent(getReturnToFromLocation())}`,
    );
    return false;
  };

  const vote = async (item: ResourceItem) => {
    if (state.pending[item.id] || state.personalLoading || !requireAccount())
      return;
    const previous = state.personal[item.id] ?? {
      voted: false,
      bookmarked: false,
    };
    const next = !previous.voted;

    setState("pending", item.id, true);
    setState("messages", item.id, "");

    try {
      const result = await setVote({ resourceId: item.id, active: next });
      if (!result || result.error) throw new Error("mutation failed");

      setState("personal", item.id, { ...previous, voted: next });
      setState(
        "voteCounts",
        item.id,
        Math.max(
          0,
          (state.voteCounts[item.id] ?? item.votes) + (next ? 1 : -1),
        ),
      );
      await refreshPersonalState();
    } catch {
      setState("messages", item.id, "");
    } finally {
      setState("pending", item.id, false);
    }
  };

  const bookmark = async (item: ResourceItem) => {
    if (state.pending[item.id] || state.personalLoading || !requireAccount())
      return;
    const previous = state.personal[item.id] ?? {
      voted: false,
      bookmarked: false,
    };
    const next = !previous.bookmarked;

    setState("pending", item.id, true);
    setState("messages", item.id, "");

    try {
      const result = next
        ? await saveBookmark(item.id)
        : await removeBookmark(item.id);
      if (!result || result.error) throw new Error("mutation failed");

      setState("personal", item.id, { ...previous, bookmarked: next });
      await refreshPersonalState();
    } catch {
      setState("messages", item.id, "");
    } finally {
      setState("pending", item.id, false);
    }
  };

  const share = async (item: ResourceItem) => {
    try {
      const result = await shareOrCopy(item.title, item.url);
      if (result === "copied") {
        setState("messages", item.id, t("resourcecard.linkCopied"));
      } else if (result === "failed") {
        setState("messages", item.id, "");
      }
    } catch {
      setState("messages", item.id, "");
    }
  };

  const votesFor = (item: ResourceItem) =>
    state.voteCounts[item.id] ?? item.votes;

  return {
    personal: () => state.personal,
    personalLoading: () => state.personalLoading,
    pending: () => state.pending,
    messages: () => state.messages,
    vote,
    bookmark,
    share,
    votesFor,
  };
}
