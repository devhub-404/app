import { atom } from "nanostores";
import {
  toAccountShellView,
  type AccountDetailsView,
  type AccountShellView,
} from "./account-projection.type.ts";

export type AccountStateStatus =
  "idle" | "loading" | "ready" | "unavailable" | "error";

export type AccountState = {
  status: AccountStateStatus;
  details: AccountDetailsView | null;
  shell: AccountShellView | null;
  error: string | null;
};

const initialState: AccountState = {
  status: "idle",
  details: null,
  shell: null,
  error: null,
};

/** Canonical account projection for the application shell and session runtime. */
export const $appAccount = atom<AccountState>(initialState);

export function setAccountLoading() {
  const current = $appAccount.get();
  $appAccount.set({ ...current, status: "loading", error: null });
}

export function setAccountDetails(details: AccountDetailsView) {
  $appAccount.set({
    status: "ready",
    details,
    shell: toAccountShellView(details),
    error: null,
  });
}

export function setAccountShell(shell: AccountShellView) {
  const current = $appAccount.get();
  $appAccount.set({ ...current, shell, error: null });
}

export function setAccountUnavailable(message: string) {
  const current = $appAccount.get();
  $appAccount.set({ ...current, status: "unavailable", error: message });
}

export function setAccountError(message: string) {
  $appAccount.set({
    status: "error",
    details: null,
    shell: null,
    error: message,
  });
}

export function clearAppAccount() {
  $appAccount.set(initialState);
}
