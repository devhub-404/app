import { notifySuccess } from "@/shared/ui/feedback/notifications";
import { GitBranch, Globe, KeyRound, Mail, MoveLeft } from "lucide-solid";
import { useAuth } from "@/features/auth/ui/hooks/use-auth.hook.ts";
import { useI18n } from "@/features/auth/i18n";
import { redirectTo } from "@/shared/utils/redirect.util.ts";
import LoginForm from "@/features/auth/ui/components/form/login-form.component.tsx";
import MagicLinkForm from "@/features/auth/ui/components/form/magic-link-form.component.tsx";
import AuthenticationContinuation from "@/features/auth/ui/components/authentication-continuation.component.tsx";
import {
  authenticationOutcomeFromResult,
  type AuthenticationOutcome,
} from "@/features/auth/types";
import { returnToFromSearch } from "@/features/auth/utils/return-to.util.ts";
import { routes } from "@/shared/navigation/routes";
import type { OAuthProvider } from "@/features/auth/types/auth.type.ts";
import type { ApiResult } from "@/shared/api";
import type { LoginResult } from "@/features/auth/types";
import { notifyAppSessionAvailable } from "@/app/session/public";
import type { Locale } from "@/shared/i18n/core";
import {
  preloadPasskeyAuthentication,
  preloadPasswordAuthentication,
} from "@/features/auth/utils/browser-auth.util.ts";
import { createSignal, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";
const Github = GitBranch;

function LoginOptions(props: { locale: Locale }) {
  const { t } = useI18n(props.locale);
  const { startOAuth, loginPasskey } = useAuth();
  const [method, setMethod] = createSignal<"password" | "magic-link">(
    "password",
  );
  const [outcome, setOutcome] = createSignal<AuthenticationOutcome | null>(
    null,
  );
  const [pendingMethod, setPendingMethod] = createSignal<string | null>(null);
  const [ready, setReady] = createSignal(false);

  onMount(() => {
    setReady(true);
    // Both methods are visible in this entry surface. Start their downloads
    // with hydration so neither OAuth/passkey interaction pays a module-load
    // penalty.
    preloadPasswordAuthentication();
    preloadPasskeyAuthentication();
  });

  const returnTo = () =>
    typeof window === "undefined"
      ? routes.feed
      : returnToFromSearch(window.location.search);

  const completeAuthentication = (
    redirect?: string | null,
    code?: string | null,
  ) => {
    notifyAppSessionAvailable();
    if (code) notifySuccess(code);
    // AccountBootstrap skips its presentation reload while the login
    // ceremony is completing, so this navigation remains the single owner
    // of the destination.
    redirectTo(redirect || returnTo());
  };

  const acceptResult = (result: ApiResult<LoginResult>) => {
    const next = authenticationOutcomeFromResult(result);
    if (next.kind === "authenticated") {
      completeAuthentication(next.redirect, result.data?.code);
      return;
    }
    setOutcome(next);
  };

  const passkey = async () => {
    if (pendingMethod()) return;
    setPendingMethod("passkey");
    const result = await loginPasskey();
    acceptResult(result);
    setPendingMethod(null);
  };

  const oauth = async (provider: OAuthProvider) => {
    if (pendingMethod()) return;
    setPendingMethod(provider);
    const result = await startOAuth(provider, {
      redirect: returnTo(),
      flow: "login",
    });
    if (result.error) {
      setOutcome({
        kind: "error",
        code: result.error.code,
        message: result.error.message,
      });
      setPendingMethod(null);
      return;
    }
    const url = result.data?.data?.url;
    if (url) window.location.assign(url);
    else setOutcome({ kind: "error", message: t("oauth.authFailed") });
    setPendingMethod(null);
  };

  const back = () => {
    setOutcome(null);
    setMethod("password");
  };

  return (
    <div class="space-y-5">
      <Show when={outcome()}>
        {(current) => (
          <AuthenticationContinuation
            outcome={current()}
            locale={props.locale}
            onChange={setOutcome}
            onAuthenticated={(redirect) => completeAuthentication(redirect)}
          />
        )}
      </Show>

      <Show when={!outcome() && method() === "password"}>
        <LoginForm
          locale={props.locale}
          onResult={acceptResult}
          ready={ready()}
        />
        <div class="my-6 flex items-center gap-3">
          <span class="h-px flex-1 bg-line" />
          <span class="text-[11px] font-semibold uppercase tracking-[.16em] text-content-muted">
            {t("login.orContinue")}
          </span>
          <span class="h-px flex-1 bg-line" />
        </div>
        <section class="space-y-3" aria-labelledby="login-alternatives-heading">
          <div>
            <h2 id="login-alternatives-heading" class="heading-tiny text-xs">
              {t("login.otherMethods")}
            </h2>
            <p class="text-muted mt-1">{t("login.otherMethodsBody")}</p>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={!ready() || pendingMethod() !== null}

              onClick={() => void oauth("google")}
              aria-busy={pendingMethod() === "google"}
              class="action action-secondary"
            >
              <Globe class="size-4" />
              {pendingMethod() === "google"
                ? t("login.openingGoogle")
                : t("login.google")}
            </button>
            <button
              type="button"
              disabled={!ready() || pendingMethod() !== null}

              onClick={() => void oauth("github")}
              aria-busy={pendingMethod() === "github"}
              class="action action-secondary"
            >
              <Github class="size-4" />
              {pendingMethod() === "github"
                ? t("login.opening")
                : t("provider.github")}
            </button>
            <button
              type="button"
              disabled={!ready() || pendingMethod() !== null}

              onClick={() => void passkey()}
              aria-busy={pendingMethod() === "passkey"}
              class="action action-secondary"
            >
              <KeyRound class="size-4" />
              {pendingMethod() === "passkey"
                ? t("common.verifying")
                : t("login.passkey")}
            </button>
            <button
              type="button"
              disabled={!ready()}
              onClick={() => setMethod("magic-link")}
              class="action action-secondary"
            >
              <Mail class="size-4" />
              {t("login.magicLink")}
            </button>
          </div>
        </section>
      </Show>

      <Show when={!outcome() && method() === "magic-link"}>
        <MagicLinkForm
          locale={props.locale}
          redirect={returnTo()}
          ready={ready()}
        />
      </Show>

      <Show when={outcome() || method() !== "password"}>
        <Portal
          mount={
            typeof document === "undefined"
              ? undefined
              : (document.getElementById("auth-top-action") ?? undefined)
          }
        >
          <button type="button" onClick={back} class="action action-ghost">
            <MoveLeft class="size-3.5" />
            {t("login.backMethods")}
          </button>
        </Portal>
      </Show>
    </div>
  );
}

export default LoginOptions;
