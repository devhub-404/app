import { createEffect, createMemo, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import {
  acceptQuestionAnswer,
  answerQuestion,
  closeQuestion,
  deleteQuestion,
  deleteQuestionAnswer,
  getQuestionQuery,
  hideQuestion,
  hideQuestionAnswer,
  removeAcceptedQuestionAnswer,
  reopenQuestion,
  unhideQuestion,
  unhideQuestionAnswer,
} from "@/features/q-and-a/actions/question.action.ts";
import type { Question } from "@/features/q-and-a/types/q-and-a.type.ts";
import {
  canAcceptQuestionAnswer,
  canCloseQuestion,
  canDeleteQuestion,
  canDeleteQuestionAnswer,
  canHideQuestion,
  canModerateQuestion,
  canReopenQuestion,
  canSubmitQuestionAnswer,
  canUnhideQuestion,
} from "@/features/q-and-a/access/question.access.ts";
import {
  isQuestionAnswerable,
  isQuestionClosable,
  isQuestionHideable,
  isQuestionReopenable,
  isQuestionUnhideable,
  isQuestionSolved,
} from "@/features/q-and-a/domain/question.domain.ts";
import { useAccount } from "@/features/account/public/account-state";
import { setVote } from "@/shared/interactions/vote/public";
import {
  getPersonalContentStates,
  refreshPersonalState,
} from "@/shared/runtime/personal-state";
import { useAppActor as useAuthSession } from "@/app/session/public";
import { routes } from "@/shared/navigation/routes";
import { redirectTo } from "@/shared/utils/redirect.util.ts";
import { useI18n } from "@/features/q-and-a/i18n";
import { shareOrCopy } from "@/shared/ui/interactions/share-or-copy";
import { createAnswerFormSchema } from "@/features/q-and-a/ui/schemas/forms.schema.ts";

type Props = {
  id: string;
  initialItem?: Question | null;
  initialError?: boolean;
};

export function useQuestionDetail(props: Props) {
  const { t, locale } = useI18n();
  const answerSchema = createAnswerFormSchema(locale());
  const { state: account } = useAccount();
  const { authenticated, role } = useAuthSession();
  const [state, setState] = createStore({
    item: (props.initialItem ?? null) as Question | null,
    loading: props.initialItem === undefined,
    loadError: Boolean(props.initialError),
    busy: false,
    votedAnswers: new Set<string>(),
    error: "",
    shareMessage: "",
  });
  let personalReadVersion = 0;

  const returnTo = () =>
    typeof location === "undefined"
      ? routes.question(props.id)
      : location.pathname + location.search;
  const actor = createMemo(() => ({
    accountId: account().details?.account.id ?? null,
    role: role(),
    organizationIds: [],
    ownerOrganizationIds: [],
  }));

  const canAccept = createMemo(() =>
    Boolean(state.item && canAcceptQuestionAnswer(state.item!, actor())),
  );
  const canModerate = createMemo(() => canModerateQuestion(actor()));
  const canClose = createMemo(() =>
    Boolean(
      state.item &&
      canCloseQuestion(actor()) &&
      isQuestionClosable(state.item!),
    ),
  );
  const canReopen = createMemo(() =>
    Boolean(
      state.item &&
      canReopenQuestion(actor()) &&
      isQuestionReopenable(state.item!),
    ),
  );
  const canHide = createMemo(() =>
    Boolean(
      state.item && canHideQuestion(actor()) && isQuestionHideable(state.item!),
    ),
  );
  const canUnhide = createMemo(() =>
    Boolean(
      state.item &&
      canUnhideQuestion(actor()) &&
      isQuestionUnhideable(state.item!),
    ),
  );
  const canDeleteCurrentQuestion = createMemo(() =>
    Boolean(state.item && canDeleteQuestion(state.item!, actor())),
  );
  const canSubmitAnswer = createMemo(() =>
    Boolean(
      state.item &&
      canSubmitQuestionAnswer(actor()) &&
      isQuestionAnswerable(state.item!),
    ),
  );
  const canDeleteAnswer = (answerId: string) =>
    Boolean(
      state.item && canDeleteQuestionAnswer(state.item!, answerId, actor()),
    );

  const loadPersonalState = async (question: Question) => {
    const version = ++personalReadVersion;
    setState("votedAnswers", new Set<string>());
    if (!authenticated() || !question.answers.length) return;
    const states = await getPersonalContentStates(
      question.answers.map((entry) => entry.id),
    );
    if (version !== personalReadVersion) return;
    setState(
      "votedAnswers",
      new Set(
        question.answers
          .filter((answer) => states[answer.id]?.voted)
          .map((answer) => answer.id),
      ),
    );
  };

  createEffect(() => {
    account().details?.account.id;
    authenticated();
    const question = state.item;
    if (question) void loadPersonalState(question);
    else setState("votedAnswers", new Set<string>());
  });

  const reload = async () => {
    setState("loading", true);
    setState("loadError", false);
    try {
      const result = await getQuestionQuery(props.id);
      setState("item", result.data?.data ?? null);
      setState(
        "loadError",
        Boolean(result.error && result.response?.status !== 404),
      );
    } catch {
      setState("loadError", true);
    } finally {
      setState("loading", false);
    }
  };

  onMount(() => {
    if (props.initialItem === undefined) void reload();
  });

  const runMutation = async (
    operation: () => Promise<{ error?: unknown }>,
    errorMessage: string,
    after?: () => void | Promise<void>,
  ) => {
    if (state.busy) return;
    setState("busy", true);
    setState("error", "");
    try {
      const result = await operation();
      if (result.error) setState("error", errorMessage);
      else if (after) await after();
    } finally {
      setState("busy", false);
    }
  };

  const submitAnswer = async (value: { content: string }) => {
    if (!state.item || !canSubmitAnswer()) return;
    const parsed = answerSchema.safeParse(value);
    if (!parsed.success) {
      setState(
        "error",
        parsed.error.issues[0]?.message ??
          t("questiondetail.couldNotPublishAnswer"),
      );
      return;
    }
    await runMutation(
      () => answerQuestion(props.id, parsed.data.content),
      t("questiondetail.couldNotPublishAnswer"),
      async () => {
        await reload();
      },
    );
  };

  const acceptAnswer = (answerId: string) => {
    if (!canAccept()) return;
    return runMutation(
      () => acceptQuestionAnswer(props.id, answerId),
      t("questiondetail.couldNotAcceptAnswer"),
      reload,
    );
  };
  const removeAcceptedAnswer = () => {
    if (!canAccept()) return;
    return runMutation(
      () => removeAcceptedQuestionAnswer(props.id),
      t("questiondetail.couldNotRemoveAcceptance"),
      reload,
    );
  };
  const deleteCurrentQuestion = () => {
    if (!canDeleteCurrentQuestion()) return;
    return runMutation(
      () => deleteQuestion(props.id),
      t("questiondetail.couldNotDeleteQuestion"),
      () => redirectTo(routes.questions),
    );
  };
  const deleteAnswer = (answerId: string) => {
    if (!canDeleteAnswer(answerId)) return;
    return runMutation(
      () => deleteQuestionAnswer(props.id, answerId),
      t("questiondetail.couldNotDeleteAnswer"),
      reload,
    );
  };
  const moderateQuestion = (
    operation: "close" | "reopen" | "hide" | "unhide",
  ) => {
    const allowed =
      operation === "close"
        ? canClose()
        : operation === "reopen"
          ? canReopen()
          : operation === "hide"
            ? canHide()
            : canUnhide();
    if (!allowed) return;
    const task =
      operation === "close"
        ? closeQuestion
        : operation === "reopen"
          ? reopenQuestion
          : operation === "hide"
            ? hideQuestion
            : unhideQuestion;
    return runMutation(
      () => task(props.id),
      t("questiondetail.couldNotUpdateQuestion"),
      reload,
    );
  };
  const moderateAnswer = (
    answerId: string,
    operation: "hideAnswer" | "unhideAnswer",
  ) => {
    if (!canModerate()) return;
    return runMutation(
      () =>
        operation === "hideAnswer"
          ? hideQuestionAnswer(answerId)
          : unhideQuestionAnswer(answerId),
      t("questiondetail.couldNotUpdateAnswer"),
      reload,
    );
  };

  const share = async (title: string, anchor?: string) => {
    const url = new URL(location.href);
    if (anchor) url.hash = anchor;
    const result = await shareOrCopy(title, url.toString());
    if (result === "copied") {
      setState("shareMessage", t("questiondetail.linkCopied"));
      setTimeout(() => setState("shareMessage", ""), 1800);
    }
  };

  const toggleAnswerVote = async (answerId: string) => {
    if (!authenticated()) {
      redirectTo(
        `${routes.auth.signIn}?redirect=${encodeURIComponent(returnTo())}`,
      );
      return;
    }
    if (state.busy) return;
    personalReadVersion += 1;
    setState("busy", true);
    try {
      const active = state.votedAnswers.has(answerId);
      const result = await setVote({ resourceId: answerId, active: !active });
      if (result.error) return;
      const next = new Set(state.votedAnswers);
      if (active) next.delete(answerId);
      else next.add(answerId);
      setState("votedAnswers", next);
      await refreshPersonalState();
      await reload();
    } finally {
      setState("busy", false);
    }
  };

  const answers = createMemo(() => {
    const question = state.item;
    return question
      ? [...question.answers].sort((a, b) =>
          a.id === question.acceptedAnswerId
            ? -1
            : b.id === question.acceptedAnswerId
              ? 1
              : b.votes - a.votes,
        )
      : [];
  });

  return {
    item: () => state.item,
    loading: () => state.loading,
    loadError: () => state.loadError,
    reload,
    busy: () => state.busy,
    error: () => state.error,
    shareMessage: () => state.shareMessage,
    authenticated,
    returnTo,
    isSolved: () => isQuestionSolved(state.item?.acceptedAnswerId),
    canAccept,
    canModerate,
    canClose,
    canReopen,
    canHide,
    canUnhide,
    canDeleteCurrentQuestion,
    canSubmitAnswer,
    canDeleteAnswer,
    answers,
    submitAnswer,
    acceptAnswer,
    removeAcceptedAnswer,
    deleteCurrentQuestion,
    deleteAnswer,
    moderateQuestion,
    moderateAnswer,
    share,
    toggleAnswerVote,
  };
}
