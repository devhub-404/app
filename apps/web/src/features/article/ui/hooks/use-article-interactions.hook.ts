import { createEffect, type Accessor } from "solid-js";
import { createStore } from "solid-js/store";
import { useStore } from "@nanostores/solid";
import { useAppActor as useAuthSession } from "@/app/session/public";
import type { ArticleItem } from "@/features/article/types/article.type.ts";
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
import { useI18n } from "@/features/article/i18n";
import { shareOrCopy } from "@/shared/ui/interactions/share-or-copy";
import { redirectTo } from "@/shared/utils/redirect.util.ts";

export type ArticlePersonalState = { voted: boolean; bookmarked: boolean };

type InteractionState = {
  personal: Record<string, ArticlePersonalState>;
  loading: boolean;
  pending: Record<string, boolean>;
  messages: Record<string, string>;
  voteCounts: Record<string, number>;
};

export function useArticleInteractions(items: Accessor<ArticleItem[]>) {
  const { t } = useI18n();
  const auth = useAuthSession();
  const scope = useStore($personalStateScope);
  const [state, setState] = createStore<InteractionState>({
    personal: {},
    loading: false,
    pending: {},
    messages: {},
    voteCounts: {},
  });

  createEffect(() => {
    const currentItems = items();
    const revision = scope().revision;
    const authenticated = auth.authenticated();
    const ids = currentItems.map((item) => item.id);

    setState("voteCounts", (current) => {
      const next = { ...current };
      for (const item of currentItems)
        if (next[item.id] === undefined) next[item.id] = item.votes;
      return next;
    });
    setState({ personal: {}, loading: authenticated && ids.length > 0 });
    if (!authenticated || ids.length === 0) return;

    void getPersonalContentStates(ids)
      .then((states) => {
        if (revision === scope().revision) setState("personal", states);
      })
      .catch(() => undefined)
      .finally(() => setState("loading", false));
  });

  const requireAccount = () => {
    if (auth.authenticated()) return true;
    redirectTo(
      `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`,
    );
    return false;
  };

  const vote = async (item: ArticleItem) => {
    if (state.pending[item.id] || state.loading || !requireAccount()) return;
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
      setState("messages", item.id, t("listing.actionFailed"));
    } finally {
      setState("pending", item.id, false);
    }
  };

  const bookmark = async (item: ArticleItem) => {
    if (state.pending[item.id] || state.loading || !requireAccount()) return;
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
      setState("messages", item.id, t("listing.actionFailed"));
    } finally {
      setState("pending", item.id, false);
    }
  };

  const share = async (item: ArticleItem) => {
    try {
      const url = new URL(
        `/articles/${encodeURIComponent(item.slug)}`,
        window.location.origin,
      ).href;
      const result = await shareOrCopy(item.title, url);
      if (result === "copied")
        setState("messages", item.id, t("articlecard.linkCopied"));
      if (result === "failed")
        setState("messages", item.id, t("articledetail.couldNotShare"));
    } catch {
      setState("messages", item.id, t("articledetail.couldNotShare"));
    }
  };

  const votesFor = (item: ArticleItem) =>
    state.voteCounts[item.id] ?? item.votes;
  return {
    personal: () => state.personal,
    personalLoading: () => state.loading,
    pending: () => state.pending,
    messages: () => state.messages,
    vote,
    bookmark,
    share,
    votesFor,
  };
}
