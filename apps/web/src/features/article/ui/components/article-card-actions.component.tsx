import { Bookmark, Link, ThumbsUp } from "lucide-solid";
import { Toggle } from "@ark-ui/solid";
import { createEffect, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { useAppActor as useAuthSession } from "@/app/session/public";
import { useStore } from "@nanostores/solid";
import {
  $personalStateScope,
  getPersonalContentState,
  refreshPersonalState,
} from "@/shared/runtime/personal-state";
import {
  removeBookmark,
  saveBookmark,
} from "@/shared/interactions/bookmark/public";
import { setVote } from "@/shared/interactions/vote/public";
import { shareOrCopy } from "@/shared/ui/interactions/share-or-copy";
import { withLocale } from "@/shared/i18n/core/solid";
import { useI18n } from "@/features/article/i18n";
import { redirectTo } from "@/shared/utils/redirect.util.ts";

type Props = { articleId: string; slug: string; title: string };

type CardActionState = {
  voted: boolean;
  bookmarked: boolean;
  loading: boolean;
  pending: boolean;
  message: string;
};

function ArticleCardActions(props: Props) {
  const { t } = useI18n();
  const auth = useAuthSession();
  const scope = useStore($personalStateScope);
  const [state, setState] = createStore<CardActionState>({
    voted: false,
    bookmarked: false,
    loading: false,
    pending: false,
    message: "",
  });

  const requireAccount = () => {
    if (auth.authenticated()) return true;
    redirectTo(
      `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`,
    );
    return false;
  };

  createEffect(() => {
    const revision = scope().revision;
    if (!auth.authenticated()) {
      setState({ voted: false, bookmarked: false });
      return;
    }
    setState("loading", true);
    void getPersonalContentState(props.articleId)
      .then((personal) => {
        if (revision !== scope().revision || !personal) return;
        setState({ voted: personal.voted, bookmarked: personal.bookmarked });
      })
      .catch(() => undefined)
      .finally(() => setState("loading", false));
  });

  const vote = async () => {
    if (state.pending || state.loading || !requireAccount()) return;
    const next = !state.voted;
    setState({ pending: true, message: "" });
    try {
      const result = await setVote({
        resourceId: props.articleId,
        active: next,
      });
      if (!result || result.error) throw new Error("mutation failed");
      setState("voted", next);
      await refreshPersonalState();
    } catch {
      setState("message", t("listing.actionFailed"));
    } finally {
      setState("pending", false);
    }
  };

  const bookmark = async () => {
    if (state.pending || state.loading || !requireAccount()) return;
    const next = !state.bookmarked;
    setState({ pending: true, message: "" });
    try {
      const result = next
        ? await saveBookmark(props.articleId)
        : await removeBookmark(props.articleId);
      if (!result || result.error) throw new Error("mutation failed");
      setState("bookmarked", next);
      await refreshPersonalState();
    } catch {
      setState("message", t("listing.actionFailed"));
    } finally {
      setState("pending", false);
    }
  };

  const share = async () => {
    const url = new URL(
      `/articles/${encodeURIComponent(props.slug)}`,
      window.location.origin,
    ).href;
    const result = await shareOrCopy(props.title, url);
    if (result === "copied") setState("message", t("articlecard.linkCopied"));
    if (result === "failed")
      setState("message", t("articledetail.couldNotShare"));
  };

  return (
    <span class="inline-flex items-center gap-[.45rem]">
      <Toggle.Root
        type="button"
        disabled={state.pending || state.loading}
        onPressedChange={() => void vote()}
        pressed={state.voted}
        aria-label={
          state.voted
            ? t("articledetail.removeVoteArticle")
            : t("articledetail.markArticleHowUseful")
        }
        class="inline-flex cursor-pointer items-center border-0 bg-transparent p-0 hover:text-content-accent disabled:opacity-50 aria-pressed:text-content-accent"
      >
        <ThumbsUp class="size-4" aria-hidden="true" />
      </Toggle.Root>
      <button
        type="button"
        onClick={() => void share()}
        aria-label={t("articledetail.shareArticle")}
        class="action action-ghost"
      >
        <Link class="size-4" aria-hidden="true" />
      </button>
      <Toggle.Root
        type="button"
        disabled={state.pending || state.loading}
        onPressedChange={() => void bookmark()}
        pressed={state.bookmarked}
        aria-label={
          state.bookmarked
            ? t("articledetail.removeArticleSaved")
            : t("articledetail.saveArticle")
        }
        class="inline-flex cursor-pointer items-center border-0 bg-transparent p-0 hover:text-content-accent disabled:opacity-50 aria-pressed:text-content-accent"
      >
        <Bookmark
          class={`size-4 ${state.bookmarked ? "fill-current" : ""}`}
          aria-hidden="true"
        />
      </Toggle.Root>
      <Show when={state.message}>
        <span role="status" class="sr-only">
          {state.message}
        </span>
      </Show>
    </span>
  );
}

export default withLocale(ArticleCardActions);
