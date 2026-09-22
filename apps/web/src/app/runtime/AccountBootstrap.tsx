import { createEffect, onCleanup, onMount } from "solid-js";
import { useStore } from "@nanostores/solid";
import { $account, setAccountShell } from "@/features/account/store/account-projection.store";
import {
  bootstrapAccount,
  refreshAccount,
} from "@/features/account/services/account-projection.service.ts";
import type { AccountShellView } from "@/features/account/types/account-details-view.type.ts";
import { redirectTo } from "@/shared/utils/redirect.util.ts";
import { routes } from "@/shared/navigation/routes";
import { clearSessionState } from "./session-cleanup";
import {
  applyLocale,
  clearLocaleOverride,
  readLocaleOverride,
} from "@/shared/i18n/core/solid";
import {
  getSessionScope,
} from "@/features/auth/public/session.ts";
import { clearSessionPersistence } from "@/shared/storage/local-database";
import {
  canAccessRoute,
  requiresRouteAuthentication,
  routeAccess,
} from "@/app/access/route.access.ts";
import { $auth } from "@/features/auth/store/auth.store.ts";

function buildRedirect(): string {
  return (
    window.location.pathname + window.location.search + window.location.hash
  );
}

function redirectToLogin() {
  if (window.location.pathname === routes.auth.signIn) return;
  const redirect = buildRedirect();
  redirectTo(`/login?redirect=${encodeURIComponent(redirect)}`);
}

type Props = {
  initialAccount?: AccountShellView | null;
  initialResolution?:
    "authenticated" | "unauthenticated" | "unavailable" | "deferred";
};

function AccountBootstrap(props: Props) {
  const state = useStore($account);
  const auth = useStore($auth);

  // A server-authenticated document already carries the authoritative
  // projection. Public documents with a session cookie defer that lookup until
  // after the initial response; an unavailable lookup remains retryable.
  let canResolveAccount = props.initialResolution !== "unauthenticated";
  let retryTimer: number | undefined;
  let retryAttempt = 0;

  const scheduleRetry = () => {
    if (retryTimer !== undefined || !canResolveAccount) return;
    const delay = Math.min(30_000, 1_000 * 2 ** retryAttempt);
    retryAttempt = Math.min(retryAttempt + 1, 5);
    retryTimer = window.setTimeout(() => {
      retryTimer = undefined;
      if (state().details) return;
      void checkRoute();
    }, delay);
  };

  const handleResolutionFailure = () => {
    const session = getSessionScope();
    if (session.status === "anonymous" || session.status === "invalidating") {
      canResolveAccount = false;
      return;
    }
    scheduleRetry();
  };

  const checkRoute = async (options: { skipLocaleReload?: boolean } = {}) => {
    const pathname = window.location.pathname;
    const access = routeAccess(pathname);
    const protectedRoute = requiresRouteAuthentication(access);

    try {
      let details = state().details;
      const shell = state().shell;
      const scope = getSessionScope();
      const sessionNeedsResolution =
        scope.status === "resolving" || scope.status === "authenticated";
      if ((!details || details.role == null) && (canResolveAccount || sessionNeedsResolution)) {
        details = await bootstrapAccount();
        canResolveAccount = false;
        retryAttempt = 0;
      }
      const role = details?.role ?? shell?.role ?? null;
      if (!details && !shell) {
        if (protectedRoute) redirectToLogin();
        return;
      }

      const preferredLocale =
        details?.preferences?.locale ?? shell?.preferences.locale ?? null;
      const renderedLocale = document.documentElement.dataset["locale"];
      if (preferredLocale === null && readLocaleOverride()) {
        // `null` means browser-managed language. Remove any stale device
        // override before the next SSR request negotiates Accept-Language.
        clearLocaleOverride();
        if (!options.skipLocaleReload) {
          window.location.reload();
          return;
        }
      }
      if (
        preferredLocale === "pt" ||
        preferredLocale === "en" ||
        preferredLocale === "es"
      ) {
        // Mirror the authoritative Account preference to the non-sensitive
        // presentation cookie for later anonymous/device requests. The first
        // authenticated SSR already uses this preference via Astro.locals.
        applyLocale(preferredLocale);
        if (preferredLocale !== renderedLocale && !options.skipLocaleReload) {
          window.location.reload();
          return;
        }
      }

      // `/me` is a server-derived projection of the current Session and roles.
      if (!canAccessRoute(access, role)) {
        redirectTo(routes.account.root);
      }
    } catch {
      // Session invalidation is published by transport and resolved by app runtime.
      // Do not clear a valid local Session merely because /me failed transiently.
      handleResolutionFailure();
    }
  };

  onMount(() => {
    if (props.initialResolution === "authenticated" && props.initialAccount) {
      setAccountShell(props.initialAccount);
    }

    const run = () => void checkRoute();

    let lastAuthRevision = auth().revision;
    createEffect(() => {
      const currentAuth = auth();
      if (currentAuth.revision === lastAuthRevision) return;
      lastAuthRevision = currentAuth.revision;
      if (currentAuth.status === "authenticated") {
        const accountId =
          state().details?.account.id ?? state().shell?.account.id ?? null;
        if (accountId === currentAuth.session.userId && state().details) return;
        clearSessionState();
        canResolveAccount = true;
        const skipLocaleReload =
          window.location.pathname === routes.auth.signIn;
        void refreshAccount()
          .then(() => {
            canResolveAccount = false;
            retryAttempt = 0;
            return checkRoute({ skipLocaleReload });
          })
          .catch(handleResolutionFailure);
        return;
      }
      if (currentAuth.status === "anonymous") {
        clearSessionState();
        canResolveAccount = false;
        void clearSessionPersistence();
        if (requiresRouteAuthentication(routeAccess(window.location.pathname)))
          redirectToLogin();
      }
    });
    run();
    document.addEventListener("astro:page-load", run);
    onCleanup(() => {
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
      document.removeEventListener("astro:page-load", run);
    });
  });

  return null;
}

export default AccountBootstrap;
