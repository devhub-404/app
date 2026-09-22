/// <reference types="astro/client" />

import type { Locale } from "@/shared/i18n/core";
import type { AccountShellView } from "@/app/session/account-projection.type.ts";
import type { ApiClient } from "@/shared/api/openapi.api.ts";

declare global {
  namespace App {
    interface Locals {
      account: AccountShellView | null;
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
