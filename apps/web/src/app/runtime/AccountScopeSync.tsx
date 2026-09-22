import { createEffect } from "solid-js";
import { useStore } from "@nanostores/solid";
import { $appAccount, clearAppAccount } from "@/app/session/app-account.store";
import { clearPersonalState } from "@/shared/runtime/personal-state";
import { setNotificationsAccountScope } from "@/features/account/public/notifications-runtime";
import { clearAppCurrentSession } from "@/app/session/app-current-session.store";
import {
  beginSessionResolution,
  getSessionScope,
  setAuthenticatedSessionScope,
  setAnonymousSessionScope,
} from "@/app/session/session-scope";

type Props = {
  initialResolution:
    "authenticated" | "unauthenticated" | "unavailable" | "deferred";
};

function AccountScopeSync(props: Props) {
  const state = useStore($appAccount);
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
        clearAppAccount();
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
      clearAppCurrentSession();
    } else {
      setNotificationsAccountScope(null);
      clearPersonalState();
      clearAppCurrentSession();
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
