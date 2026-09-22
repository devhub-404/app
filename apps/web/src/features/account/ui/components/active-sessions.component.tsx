import Alert from "@/shared/ui/components/feedback/alert.component.tsx";
import { redirectTo } from "@/shared/utils/redirect.util.ts";
import { useAccount } from "@/features/account/ui/hooks/use-account.hook.ts";
import { useAppActor, refreshAppCurrentSession } from "@/app/session/public";
import type { AuthSessionDTO } from "@/features/account/types/account.type.ts";
import { LogOut, RefreshCw, Trash } from "lucide-solid";
import { routes } from "@/shared/navigation/routes";
import { formatLocalizedDate, type Locale } from "@/shared/i18n/core";
import { withLocale } from "@/shared/i18n/core/solid";
import { useI18n } from "@/features/account/i18n";
import ListPanelList from "@/shared/ui/components/surfaces/list-panel-list.component.tsx";
import StatusBadge from "@/shared/ui/components/feedback/status-badge.component.tsx";
import PossessionProofStep from "./widgets/settings/security/possession-proof-step.component.tsx";
import { usePossessionProofFlow } from "../hooks/use-possession-proof-flow.hook.ts";
import { createMemo, createSignal, For, onMount, Show } from "solid-js";
function formatDate(value: string, locale: Locale) {
  return formatLocalizedDate(value, locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function ActiveSessions() {
  const { t, locale } = useI18n();
  function sessionLabel(session: AuthSessionDTO) {
    if (session.deviceName) return session.deviceName;
    if (session.userAgent) {
      const agent = session.userAgent.toLowerCase();
      if (agent.includes("firefox")) return "Firefox";
      if (agent.includes("edg/")) return "Edge";
      if (agent.includes("chrome")) return "Chrome";
      if (agent.includes("safari")) return "Safari";
    }
    return t("activesessions.deviceNotIdentified");
  }
  const {
    refreshSessions,
    revokeSession,
    logoutAllSessions,
    logoutOtherSessions,
  } = useAccount();
  const { sessionId } = useAppActor();
  const [sessions, setSessions] = createSignal<AuthSessionDTO[]>([]);
  const [currentSessionReady, setCurrentSessionReady] = createSignal(false);
  const [loading, setLoading] = createSignal(true);
  const [pending, setPending] = createSignal<string | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [confirmAll, setConfirmAll] = createSignal(false);
  const proof = usePossessionProofFlow();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [result, currentSession] = await Promise.all([
        refreshSessions(),
        refreshAppCurrentSession(),
      ]);
      if (result.ok) setSessions(result.items);
      else setError(t("activesessions.couldNotLoadSessionsNow"));
      setCurrentSessionReady(currentSession !== null);
      if (!currentSession)
        setError(t("activesessions.couldNotLoadSessionsNow"));
    } catch {
      setError(t("activesessions.couldNotLoadSessionsNow"));
    } finally {
      setLoading(false);
    }
  };

  onMount(() => void load());

  const sortedSessions = createMemo(() =>
    [...sessions()].sort((a, b) =>
      (b.lastProofOfPossessionAt ?? "").localeCompare(
        a.lastProofOfPossessionAt ?? "",
      ),
    ),
  );

  const remove = async (id: string) => {
    if (pending()) return;
    setPending(id);
    setError(null);
    try {
      if (sessionId() === id) {
        const result = await proof.execute(
          () => revokeSession(id),
          () => {
            redirectTo(routes.auth.signIn);
          },
        );
        if (result.kind === "failure") {
          setError(t("activesessions.couldNotCloseSessionCurrent"));
          return;
        }
        return;
      }

      const result = await proof.execute(
        () => revokeSession(id),
        () => {
          setSessions((items) => items.filter((item) => item.id !== id));
        },
      );
      if (result.kind === "failure")
        setError(t("activesessions.couldNotCloseThisSession"));
    } catch {
      setError(t("activesessions.couldNotCloseThisSession"));
    } finally {
      setPending(null);
    }
  };

  const logoutOthers = async () => {
    if (pending()) return;
    setPending("others");
    setError(null);
    try {
      const result = await proof.execute(() => logoutOtherSessions(), load);
      if (result.kind === "failure")
        setError(t("activesessions.couldNotCloseOtherSessions"));
    } catch {
      setError(t("activesessions.couldNotCloseOtherSessions"));
    } finally {
      setPending(null);
    }
  };

  const logoutAll = async () => {
    if (!confirmAll()) {
      setConfirmAll(true);
      return;
    }
    if (pending()) return;
    setPending("all");
    setError(null);
    try {
      const result = await proof.execute(
        () => logoutAllSessions(),
        () => redirectTo(routes.auth.signIn),
      );
      if (result.kind === "failure") {
        setError(t("activesessions.couldNotCloseAllSessions"));
        setConfirmAll(false);
        return;
      }
    } catch {
      setError(t("activesessions.couldNotCloseAllSessions"));
      setConfirmAll(false);
    } finally {
      setPending(null);
    }
  };

  return (
    <div class="space-y-5">
      <Show when={proof.open()}>
        <PossessionProofStep
          busy={proof.busy()}
          proofSent={proof.sent()}
          reauthRequired={proof.mfaRequired()}
          mfaRequired={proof.mfaRequired()}
          error={proof.error()}
          onRequest={() => void proof.request()}
          onConfirm={(input) => void proof.confirm(input)}
          onClose={proof.dismiss}
        />
      </Show>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class="text-muted">
            {t(
              "activesessions.recognizeDevicesStillHasSessionValidAccessAccountCloseSession",
            )}
          </p>
          <p class="text-caption mt-1">
            {t(
              "activesessions.credentialSessionNeverShownThisScreenShowsOnlyMetadataNot",
            )}
          </p>
        </div>
        <div class="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            disabled={pending() !== null}

            onClick={() => void logoutOthers()}
            aria-busy={pending() === "others"}
            class="action action-secondary"
          >
            <LogOut class="size-4" aria-hidden="true" />
            {pending() === "others"
              ? t("sessions.ending")
              : t("sessions.endOthers")}
          </button>
          <button
            type="button"
            disabled={pending() !== null}

            onClick={() => void logoutAll()}
            aria-busy={pending() === "all"}
            class="action action-danger"
          >
            <LogOut class="size-4" />
            {pending() === "all"
              ? t("sessions.ending")
              : confirmAll()
                ? t("sessions.confirmEndAll")
                : t("sessions.endAll")}
          </button>
          <Show when={confirmAll()}>
            <button
              type="button"
              disabled={pending() !== null}
              onClick={() => setConfirmAll(false)}
              class="action action-secondary"
            >
              {t("myarticles.cancel")}
            </button>
          </Show>
        </div>
      </div>

      <Show when={error()}>
        <Alert status="danger">{error()}</Alert>
      </Show>

      <div
        class="rounded-3xl border border-line bg-surface-elevated p-4 shadow-sm"
        aria-live="polite"
      >
        <Show
          when={!loading()}
          fallback={
            <p class="text-muted">{t("activesessions.loadingSessions")}</p>
          }
        >
          <Show
            when={sortedSessions().length > 0}
            fallback={
              <div class="space-y-3">
                <p class="text-muted">
                  {t("activesessions.noSessionActiveFound")}
                </p>
                <button
                  type="button"
                  onClick={() => void load()}
                  class="action action-secondary"
                >
                  <RefreshCw class="size-4" aria-hidden="true" />
                  {t("myarticles.tryAgain")}
                </button>
              </div>
            }
          >
            <ListPanelList>
              <For each={sortedSessions()}>
                {(session) => {
                  const current = () => sessionId() === session.id;
                  return (
                    <li class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                          <p class="text-strong truncate">
                            {sessionLabel(session)}
                          </p>
                          <Show when={current()}>
                            <StatusBadge
                              status="accent"
                              class="min-h-6 px-2 py-0.5 text-[11px]"
                            >
                              {t("activesessions.sessionCurrent")}
                            </StatusBadge>
                          </Show>
                        </div>
                        <p class="text-caption mt-1">
                          {session.authMethod} {t("activesessions.created")}{" "}
                          {formatDate(session.createdAt, locale())}{" "}
                          {t("activesessions.lastProof")}{" "}
                          {formatDate(
                            session.lastProofOfPossessionAt,
                            locale(),
                          )}{" "}
                          {t("activesessions.expires")}{" "}
                          {formatDate(session.expiresAt, locale())}
                        </p>
                        <div class="mt-1 flex flex-col gap-0.5 text-[0.7rem] text-content-muted">
                          <Show when={session.ipAddress}>
                            <span>
                              {t("activesessions.ip")} {session.ipAddress}
                            </span>
                          </Show>
                          <Show when={session.userAgent}>
                            <span class="truncate">{session.userAgent}</span>
                          </Show>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={pending() !== null || !currentSessionReady()}

                        onClick={() => void remove(session.id)}
                        aria-busy={pending() === session.id}
                        class="action action-danger-outline"
                      >
                        <Trash class="size-4" />
                        {pending() === session.id
                          ? t("sessions.ending")
                          : current()
                            ? t("sessions.endCurrent")
                            : t("sessions.end")}
                      </button>
                    </li>
                  );
                }}
              </For>
            </ListPanelList>
          </Show>
        </Show>
      </div>
    </div>
  );
}

export default withLocale(ActiveSessions);
