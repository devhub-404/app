import { createEffect } from "solid-js";
import {
  clearAccount,
  useAccount,
} from "@/features/account/public/account-state";
import { clearPersonalState } from "@/shared/runtime/personal-state";
import { setNotificationsAccountScope } from "@/features/account/public/notifications-runtime";
import { clearCurrentSession } from "@/features/auth/public/session";
import {
  beginSessionResolution,
  getSessionScope,
  setAuthenticatedSessionScope,
  setAnonymousSessionScope,
} from "@/shared/runtime/session-scope";

type Props = {
  initialResolution:
    "authenticated" | "unauthenticated" | "unavailable" | "deferred";
};

function AccountScopeSync(props: Props) {
  const { state } = useAccount();
  let initialResolutionPending = true;
  let lastAccountId: string | null | undefined;

  createEffect(() => {
    const accountId =
      state().details?.account.id ?? state().shell?.account.id ?? null;
    if (accountId === lastAccountId) return;
    lastAccountId = accountId;
    if (accountId) {
      const scope = getSessionScope();
      // An account projection can outlive the session event during an Astro
      // swap. Never let that stale projection resurrect an authenticated
      // scope after logout; a real login/cross-tab login marks the scope as
      // resolving before the projection is allowed back in.
      if (scope.status === "anonymous" || scope.status === "invalidating") {
        clearAccount();
        return;
      }
      initialResolutionPending = false;
      if (scope.status === "authenticated" && scope.accountId === accountId) {
        // This island is recreated by Astro ClientRouter. The session and
        // personal runtime already own this Account; remounting the island
        // must not start another resolution/sync wave.
        setNotificationsAccountScope(accountId);
        return;
      }
      setAuthenticatedSessionScope(accountId);
      setNotificationsAccountScope(accountId);
      clearCurrentSession();
    } else {
      setNotificationsAccountScope(null);
      clearPersonalState();
      clearCurrentSession();
      const scope = getSessionScope();
      if (scope.status === "resolving") {
        // A cross-tab login or the initial SSR resolution deliberately clears
        // the old projection before re-reading /me. Keep the transitional
        // state intact so privateClient can perform that resolution instead
        // of rejecting it as an anonymous request.
      } else if (
        initialResolutionPending &&
        props.initialResolution !== "unauthenticated" &&
        scope.status !== "authenticated" &&
        scope.status !== "unavailable"
      ) {
        beginSessionResolution();
      } else if (
        scope.status !== "authenticated" &&
        scope.status !== "unavailable"
      ) {
        setAnonymousSessionScope();
      }
      initialResolutionPending = false;
    }
  });

  return null;
}

export default AccountScopeSync;
