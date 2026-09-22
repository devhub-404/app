import { createMemo } from "solid-js";
import { useAuth } from "@/features/auth/public";
import { useAuthActor as useAuthSession } from "@/features/auth/public";
import { routes } from "@/shared/navigation/routes";
import { redirectTo } from "@/shared/utils/redirect.util.ts";
import type { AccountShellView } from "@/features/account/types/account-details-view.type.ts";
import type { AuthSession } from "@/features/auth/types/auth-session.type.ts";

export function useUserMenuState(
  initialAccount?: AccountShellView | null,
  initialSession?: AuthSession | null,
) {
  const { logout } = useAuth();
  const { session, role } = useAuthSession(initialAccount, initialSession);

  const displayName = createMemo(() => {
    const current = session();
    if (current.status !== "authenticated") return null;
    const profile = current.me.profile;
    return profile?.displayName || profile?.username || null;
  });

  const username = createMemo(() => {
    const current = session();
    if (current.status !== "authenticated") return null;
    return current.me.profile?.username ?? null;
  });

  const avatarUrl = createMemo(() => {
    const current = session();
    if (current.status !== "authenticated") return null;
    return current.me.profile?.avatarUrl ?? null;
  });

  const avatarFallback = createMemo(() => {
    const base = (displayName() ?? username() ?? "").trim().replace(/^@+/, "");
    if (!base) return "?";
    return (base[0] ?? "?").toUpperCase();
  });

  const publicProfileHref = createMemo(() => {
    const value = username();
    if (!value) return routes.account.root;
    return routes.profile(value);
  });

  const loginHref = createMemo(
    () => `${routes.auth.signIn}?redirect=${encodeURIComponent(routes.feed)}`,
  );
  const hasPanelAccess = createMemo(() => role() !== null);

  const handleLogout = () => {
    void logout().then((ok) => {
      if (ok) redirectTo(routes.auth.signIn);
    });
  };

  return {
    session,
    displayName,
    username,
    avatarUrl,
    avatarFallback,
    publicProfileHref,
    loginHref,
    hasPanelAccess,
    handleLogout,
  };
}
