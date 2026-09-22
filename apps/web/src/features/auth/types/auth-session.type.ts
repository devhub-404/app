import type { components } from "@devhub-404/api-contract";

export type AuthSession = components["schemas"]["SessionDTO"];

export type AuthState =
  | {
      status: "unknown" | "resolving" | "unavailable";
      session: null;
      revision: number;
    }
  | {
      status: "anonymous" | "invalidating";
      session: null;
      revision: number;
    }
  | {
      status: "authenticated";
      session: AuthSession;
      revision: number;
    };

export type AuthSessionStatus = AuthState["status"];

