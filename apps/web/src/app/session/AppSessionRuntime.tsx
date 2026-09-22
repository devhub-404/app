import AccountBootstrap from "@/app/runtime/AccountBootstrap";
import AccountScopeSync from "@/app/runtime/AccountScopeSync";
import type { AccountShellView } from "./account-projection.type.ts";

type InitialResolution =
  "authenticated" | "unauthenticated" | "unavailable" | "deferred";

type Props = {
  initialAccount?: AccountShellView | null;
  initialResolution: InitialResolution;
};

/**
 * Single persistent application-level owner of session/account bootstrap.
 * Feature islands consume its projections but do not own session lifecycle.
 */
export default function AppSessionRuntime(props: Props) {
  return (
    <>
      <AccountBootstrap
        initialAccount={props.initialAccount}
        initialResolution={props.initialResolution}
      />
      <AccountScopeSync initialResolution={props.initialResolution} />
    </>
  );
}
