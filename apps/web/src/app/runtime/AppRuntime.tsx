import AccountBootstrap from "@/app/runtime/AccountBootstrap";
import AccountScopeSync from "@/app/runtime/AccountScopeSync";
import type { AccountShellView } from "@/features/account/types/account-details-view.type.ts";
import AuthRuntime from "@/features/auth/runtime/auth-runtime";
import type { AuthSessionView } from "@/features/auth/public/server.ts";

type InitialResolution =
  | "authenticated"
  | "unauthenticated"
  | "unavailable"
  | "deferred";

type Props = {
  initialAccount?: AccountShellView | null;
  initialSession?: AuthSessionView | null;
  initialResolution: InitialResolution;
};

/** Application composition only. Authentication ownership remains in auth. */
export default function AppRuntime(props: Props) {
  return (
    <>
      <AuthRuntime
        initialResolution={props.initialResolution}
        initialSession={props.initialSession}
      />
      <AccountBootstrap
        initialAccount={props.initialAccount}
        initialResolution={props.initialResolution}
      />
      <AccountScopeSync />
    </>
  );
}
