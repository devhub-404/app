import { redirectTo } from "@/shared/utils/redirect.util.ts";
import { useAuth } from "@/features/auth/ui/hooks/use-auth.hook.ts";
import { useI18n } from "@/features/auth/i18n";
import AuthenticationContinuation from "@/features/auth/ui/components/authentication-continuation.component.tsx";
import {
  authenticationOutcomeFromResult,
  type AuthenticationOutcome,
} from "@/features/auth/types";
import { sanitizeReturnTo } from "@/features/auth/utils/return-to.util.ts";
import { routes } from "@/shared/navigation/routes";
import { notifyAppSessionAvailable } from "@/app/session/public";
import type { Locale } from "@/shared/i18n/core";
import { createSignal, onMount, Show } from "solid-js";
function MagicLinkCallback(props: { locale: Locale }) {
  const { t } = useI18n(props.locale);
  const { completeMagicLink } = useAuth();
  const [loading, setLoading] = createSignal(true);
  const [outcome, setOutcome] = createSignal<AuthenticationOutcome | null>(
    null,
  );
  const [returnTo, setReturnTo] = createSignal<string>(routes.feed);

  const authenticated = () => {
    notifyAppSessionAvailable();
    redirectTo(returnTo());
  };

  onMount(async () => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setOutcome({ kind: "error", message: t("magic.invalidProof") });
      setLoading(false);
      return;
    }
    const result = await completeMagicLink(token);
    const redirect = sanitizeReturnTo(result.data?.data?.redirect, routes.feed);
    setReturnTo(redirect);
    const next = authenticationOutcomeFromResult(result);
    if (next.kind === "authenticated") {
      authenticated();
      return;
    }
    setOutcome(next);
    setLoading(false);
  });

  return (
    <div class="space-y-4" aria-live="polite">
      <Show when={loading()}>
        <p class="text-muted">{t("magic.validating")}</p>
      </Show>
      <Show when={outcome()}>
        {(current) => (
          <AuthenticationContinuation
            outcome={current()}
            locale={props.locale}
            onChange={setOutcome}
            onAuthenticated={authenticated}
          />
        )}
      </Show>
      <Show when={!loading() && outcome()?.kind === "error"}>
        <a
          class="inline-flex rounded-full border border-line px-4 py-2 text-sm font-semibold text-content"
          href={routes.auth.signIn}
        >
          {t("common.backToLogin")}
        </a>
      </Show>
    </div>
  );
}

export default MagicLinkCallback;
