import type { Actor } from '../../auth/public/access.ts';

export function canSuspendAccount(actor: Actor): boolean {
  return actor.role === 'admin';
}

export function canUnsuspendAccount(actor: Actor): boolean {
  return actor.role === 'admin';
}

export function canBanAccount(actor: Actor): boolean {
  return actor.role === 'admin';
}

export function canUnbanAccount(actor: Actor): boolean {
  return actor.role === 'admin';
}
