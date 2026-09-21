import { atom } from 'nanostores';
import type { components } from '@devhub-404/api-contract';

type SessionDTO = components['schemas']['SessionDTO'];

export const $currentSession = atom<SessionDTO | null>(null);
export function setCurrentSession(session: SessionDTO | null) {
  $currentSession.set(session);
}
export function clearCurrentSession() {
  $currentSession.set(null);
}
