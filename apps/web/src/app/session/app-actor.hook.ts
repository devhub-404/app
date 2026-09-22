import { useStore } from "@nanostores/solid";
import { createMemo } from "solid-js";
import { $appAccount } from "./app-account.store";
import { $appCurrentSession } from "./app-current-session.store";
import { $appSessionScope } from "./session-scope";

export function useAppActor() {
  const account = useStore($appAccount);
  const scope = useStore($appSessionScope);
  const currentSession = useStore($appCurrentSession);

  const session = createMemo(() => {
    const snapshot = account();
    const currentScope = scope();
    const profile = snapshot.details?.profile ?? snapshot.shell?.profile;
    if (currentScope.status !== "authenticated" || !profile) {
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
    const snapshot = account();
    return snapshot.details?.role ?? snapshot.shell?.role ?? null;
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
