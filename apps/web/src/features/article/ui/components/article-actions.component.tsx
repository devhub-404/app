import ToggleButton from "@/shared/ui/components/actions/toggle-button.component.tsx";
import { createEffect, onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";
import {
  Bookmark,
  Copy,
  MessageCircle,
  Pencil,
  Share2,
  ThumbsUp,
} from "lucide-solid";
import { useAccount } from "@/features/account/public/account-state";
import { useAppActor as useAuthSession } from "@/app/session/public";
import {
  getPersonalContentState,
  refreshPersonalState,
} from "@/shared/runtime/personal-state";
import {
  removeBookmark,
  saveBookmark,
} from "@/shared/interactions/bookmark/public";
import { setVote } from "@/shared/interactions/vote/public";
import { recordView } from "@/shared/interactions/view/public";
import { routes } from "@/shared/navigation/routes";
import { redirectTo } from "@/shared/utils/redirect.util.ts";
import { shareOrCopy } from "@/shared/ui/interactions/share-or-copy";
import { withLocale } from "@/shared/i18n/core/solid";
import { useI18n } from "@/features/article/i18n";
import { ReportButton } from "@/features/report/public";

type Props = {
  articleId: string;
  slug: string;
  title: string;
  authorAccountId: string | null;
  votes: number;
};

function ArticleActions(props: Props) {
  const { t, locale } = useI18n();
  const { authenticated } = useAuthSession();
  const { state: account } = useAccount();
  const [state, setState] = createStore({
    voted: false,
    bookmarked: false,
    voteCount: props.votes,
    pending: false,
    message: "",
    mounted: false,
  });
  let personalReadVersion = 0;
  let loadedAccountId: string | null | undefined;

  const requireAccount = () => {
    if (authenticated()) return true;
    redirectTo(
      `${routes.auth.signIn}?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`,
    );
    return false;
  };

  const loadPersonalState = async () => {
    const version = ++personalReadVersion;
    setState({ voted: false, bookmarked: false });
    if (!authenticated()) return;

    const cached = await getPersonalContentState(props.articleId);
    if (version !== personalReadVersion) return;
    if (cached) {
      setState({ voted: cached.voted, bookmarked: cached.bookmarked });
    }
  };

  createEffect(() => {
    const sessionReady = authenticated();
    const accountId = account().details?.account.id ?? null;
    if (!sessionReady || !accountId) {
      loadedAccountId = undefined;
      setState({ voted: false, bookmarked: false });
      return;
    }
    if (accountId === loadedAccountId) return;
    loadedAccountId = accountId;
    void loadPersonalState();
  });

  onMount(() => {
    setState("mounted", true);
    void recordView(props.articleId);
    try {
      const recent = JSON.parse(
        localStorage.getItem("devhub.article.recent") ?? "[]",
      ) as string[];
      localStorage.setItem(
        "devhub.article.recent",
        JSON.stringify(
          [props.slug, ...recent.filter((slug) => slug !== props.slug)].slice(
            0,
            6,
          ),
        ),
      );
    } catch {}
  });

  const toggleVote = async () => {
    if (state.pending || !requireAccount()) return;
    const previous = state.voted;
    const next = !previous;
    personalReadVersion += 1;
    setState("pending", true);
    try {
      const result = await setVote({
        resourceId: props.articleId,
        active: next,
      });
      if (result.error) return;
      setState("voted", next);
      setState("voteCount", (count) => Math.max(0, count + (next ? 1 : -1)));
      void refreshPersonalState().catch(() => undefined);
    } finally {
      setState("pending", false);
    }
  };

  const toggleBookmark = async () => {
    if (state.pending || !requireAccount()) return;
    const next = !state.bookmarked;
    personalReadVersion += 1;
    setState("pending", true);
    try {
      const result = next
        ? await saveBookmark(props.articleId)
        : await removeBookmark(props.articleId);
      if (!result.error) {
        setState("bookmarked", next);
        void refreshPersonalState().catch(() => undefined);
      }
    } finally {
      setState("pending", false);
    }
  };

  const clearMessageLater = () =>
    setTimeout(() => setState("message", ""), 2000);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState("message", t("articledetail.linkCopied"));
    } catch {
      setState("message", t("articledetail.couldNotShare"));
    }
    clearMessageLater();
  };

  const share = async () => {
    const result = await shareOrCopy(props.title, window.location.href);
    if (result === "copied") setState("message", t("articledetail.linkCopied"));
    if (result === "failed")
      setState("message", t("articledetail.couldNotShare"));
    if (result !== "shared") clearMessageLater();
  };

  const canEdit = () =>
    Boolean(
      account().details?.account.id &&
      account().details?.account.id === props.authorAccountId,
    );

  return (
    <div
      class="flex flex-wrap items-center gap-2"
      aria-label={t("articledetail.articleActions")}
      role="group"
    >
      <ToggleButton
        type="button"
        disabled={state.pending}
        onClick={() => void toggleVote()}
        pressed={state.voted}
        aria-label={
          state.voted
            ? t("articledetail.removeVoteArticle")
            : t("articledetail.markArticleHowUseful")
        }
        title={state.voted ? t("articledetail.removeVote") : t("article.vote")}
      >
        <ThumbsUp class="size-4" aria-hidden="true" />
      </ToggleButton>
      <span
        class="text-xs text-content-muted"
        aria-label={t("articledetail.value0Votes", [state.voteCount])}
      >
        {state.voteCount}
      </span>
      <ToggleButton
        type="button"
        disabled={state.pending}
        onClick={() => void toggleBookmark()}
        pressed={state.bookmarked}
        aria-label={
          state.bookmarked
            ? t("articledetail.removeArticleSaved")
            : t("articledetail.saveArticle")
        }
        title={
          state.bookmarked
            ? t("articledetail.removeSaved")
            : t("articledetail.save")
        }
      >
        <Bookmark class="size-4" aria-hidden="true" />
      </ToggleButton>
      <button
        type="button"
        onClick={() =>
          document
            .getElementById("article-comments")
            ?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
        aria-label={t("articledetail.goComments")}
        title={t("articledetail.comments")}
        class="action action-secondary"
      >
        <MessageCircle class="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => void share()}
        aria-label={t("articledetail.shareArticle")}
        title={t("articledetail.share")}
        class="action action-secondary"
      >
        <Share2 class="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => void copyLink()}
        aria-label={t("articledetail.copyLinkArticle")}
        title={t("articledetail.copyLink")}
        class="action action-secondary"
      >
        <Copy class="size-4" aria-hidden="true" />
      </button>
      <ReportButton target="resource" id={props.articleId} locale={locale()} />
      <Show when={state.mounted && canEdit()}>
        <a
          href={routes.articleEdit(props.articleId)}
          aria-label={t("articledetail.editArticle")}
          title={t("articledetail.editArticle")}
          class="action action-ghost"
        >
          <Pencil class="size-4" aria-hidden="true" />
        </a>
      </Show>
      <Show when={state.message}>
        <span
          class="text-xs text-content-muted"
          role="status"
          aria-live="polite"
        >
          {state.message}
        </span>
      </Show>
    </div>
  );
}

export default withLocale(ArticleActions);
