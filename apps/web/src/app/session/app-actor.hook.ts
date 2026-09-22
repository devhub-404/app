import { useStore } from "@nanostores/solid";
import { createMemo } from "solid-js";
import { $appAccount } from "./app-account.store";
import { $appCurrentSession } from "./app-current-session.store";
import { $appSessionScope } from "./session-scope";
import type { AccountShellView } from "./account-projection.type.ts";

export function useAppActor(initialAccount?: AccountShellView | null) {
  const account = useStore($appAccount);
  const scope = useStore($appSessionScope);
  const currentSession = useStore($appCurrentSession);

  const session = createMemo(() => {
    const snapshot = account();
    const currentScope = scope();
    const profile = snapshot.details?.profile ?? snapshot.shell?.profile;
    const initialProfile = initialAccount?.profile;
    const canUseInitialAccount =
      initialAccount &&
      (currentScope.status === "unknown" ||
        currentScope.status === "resolving" ||
        (currentScope.status === "authenticated" &&
          currentScope.accountId === initialAccount.account.id));
    if ((!profile || currentScope.status !== "authenticated") && canUseInitialAccount && initialProfile) {
      return {
        status: "authenticated" as const,
        me: {
          profile: {
            username: initialProfile.username ?? "",
            displayName: initialProfile.displayName ?? "",
            avatarUrl: initialProfile.avatarUrl ?? "",
          },
        },
      };
    }
    const resolvedDuringCurrentResolution =
      currentScope.status === "resolving" && snapshot.details !== null;
    if (
      (currentScope.status !== "authenticated" && !resolvedDuringCurrentResolution) ||
      !profile
    ) {
      return { status: "unauthenticated" as const, me: null };
    }
    return {
      status: "authenticated" as const,
      me: {
        profile: {
          username: profile.username ?? "",
          displayName: profile.displayName ?? "",
          avatarUrl: profile.avatarUrl ?? "",
        },
      },
    };
  });

  const authenticated = createMemo(() => session().status === "authenticated");
  const role = createMemo(() => {
    if (!authenticated()) return null;
    const currentScope = scope();
    const snapshot = account();
    if (snapshot.details?.role != null) return snapshot.details.role;
    if (snapshot.shell?.role != null) return snapshot.shell.role;
    if (
      initialAccount &&
      (currentScope.status === "unknown" ||
        currentScope.status === "resolving" ||
        (currentScope.status === "authenticated" &&
          currentScope.accountId === initialAccount.account.id))
    ) {
      return initialAccount.role;
    }
    return null;
  });

  return {
    session,
    authenticated,
    sessionId: createMemo(() => currentSession()?.id ?? null),
    role,
    accountId: createMemo(
      () =>
        account().details?.account.id ?? account().shell?.account.id ?? null,
    ),
  };
}
