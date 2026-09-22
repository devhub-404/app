import { createEffect } from "solid-js";
import { useStore } from "@nanostores/solid";
import { $account, clearAccount } from "@/features/account/store/account-projection.store";
import { clearPersonalState } from "@/shared/runtime/personal-state";
import { setNotificationsAccountScope } from "@/features/account/public/notifications-runtime";
import {
  getSessionScope,
} from "@/features/auth/public/session.ts";

function AccountScopeSync() {
  const state = useStore($account);
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
      if (scope.status === "authenticated" && scope.accountId === accountId) {
        // This island is recreated by Astro ClientRouter. The session and
        // personal runtime already own this Account; remounting the island
        // must not start another resolution/sync wave.
        setNotificationsAccountScope(accountId);
        return;
      }
      setNotificationsAccountScope(accountId);
    } else {
      setNotificationsAccountScope(null);
      clearPersonalState();
      const scope = getSessionScope();
      if (scope.status === "resolving") {
        // A cross-tab login or the initial SSR resolution deliberately clears
        // the old projection before re-reading /me. Keep the transitional
        // state intact so privateClient can perform that resolution instead
        // of rejecting it as an anonymous request.
      }
    }
  });

  return null;
}

export default AccountScopeSync;
