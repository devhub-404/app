/// <reference types="astro/client" />

import type { Locale } from "@/shared/i18n/core";
import type { AccountShellView } from "@/features/account/types/account-details-view.type.ts";
import type { AuthSessionView } from "@/features/auth/api/session-server.api.ts";
import type { ApiClient } from "@/shared/api/openapi.api.ts";

declare global {
  namespace App {
    interface Locals {
      account: AccountShellView | null;
      session: AuthSessionView | null;
      accountResolution:
        "authenticated" | "unauthenticated" | "unavailable" | "deferred";
      sessionDurationMs?: number;
      sessionLookup?: "required" | "skipped";
      locale: Locale;
      api: ApiClient;
    }
  }
}

export {};
