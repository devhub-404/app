import { atom } from 'nanostores';
import { toAccountShellView, type AccountDetailsView, type AccountShellView } from '../types/account-details-view.type.ts';

export type AccountStateStatus = 'idle' | 'loading' | 'ready' | 'unavailable' | 'error';

export type AccountState = {
  status: AccountStateStatus;
  details: AccountDetailsView | null;
  shell: AccountShellView | null;
  error: string | null;
};

const initialState: AccountState = { status: 'idle', details: null, shell: null, error: null };
export const $account = atom<AccountState>(initialState);

export function setAccountLoading() {
  const current = $account.get();
  $account.set({ ...current, status: 'loading', error: null });
}

export function setAccountDetails(details: AccountDetailsView) {
  $account.set({ status: 'ready', details, shell: toAccountShellView(details), error: null });
}

export function setAccountShell(shell: AccountShellView) {
  const current = $account.get();
  $account.set({ ...current, shell, error: null });
}

export function setAccountUnavailable(message: string) {
  const current = $account.get();
  $account.set({ ...current, status: 'unavailable', error: message });
}

export function setAccountError(message: string) {
  $account.set({ status: 'error', details: null, shell: null, error: message });
}

export function clearAccount() {
  $account.set(initialState);
}
