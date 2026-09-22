import { useStore } from "@nanostores/solid";
import { createMemo } from "solid-js";
import { $account } from "@/features/account/public/client-state.ts";
import { $auth } from "@/features/auth/store/auth.store.ts";
import type { AccountShellView } from "@/features/account/types/account-details-view.type.ts";
import type { Actor } from "./actor.access.ts";
import type { AuthSession } from "../types/auth-session.type.ts";

export function useAuthActor(
  initialAccount?: AccountShellView | null,
  initialSession?: AuthSession | null,
) {
  const account = useStore($account);
  const auth = useStore($auth);

  const authenticated = createMemo(
    () =>
      auth().status === "authenticated" ||
      (auth().status === "unknown" && initialSession != null),
  );
  const profile = createMemo(() => {
    const current = account();
    return current.details?.profile ?? current.shell?.profile ?? initialAccount?.profile;
  });
  const session = createMemo(() =>
    authenticated() && profile()
      ? {
          status: "authenticated" as const,
          me: {
            profile: {
              username: profile()?.username ?? "",
              displayName: profile()?.displayName ?? "",
              avatarUrl: profile()?.avatarUrl ?? "",
            },
          },
        }
      : { status: "unauthenticated" as const, me: null },
  );
  const role = createMemo(() => {
    if (!authenticated()) return null;
    return account().details?.role ?? account().shell?.role ?? initialAccount?.role ?? null;
  });

  return {
    session,
    authenticated,
    sessionId: createMemo(() => {
      const state = auth();
      return state.status === "authenticated" ? state.session.id : initialSession?.id ?? null;
    }),
    role,
    accountId: createMemo(() => {
      const state = auth();
      return state.status === "authenticated"
        ? state.session.userId
        : initialSession?.userId ?? null;
    }),
  };
}

export type AuthActor = Actor;
