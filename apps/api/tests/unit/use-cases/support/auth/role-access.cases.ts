import { describe, expect, it } from 'vitest';
import { hasAnyRole, hasEditorialAuthority, hasModerationAuthority, hasRole, Role } from '@/shared/kernel/auth/role';

describe('role access', () => {
  it('accepts an explicitly assigned role', () => {
    expect(hasRole(Role.MODERATOR, Role.MODERATOR)).toBe(true);
  });

  it('does not infer privileges from another role', () => {
    expect(hasRole(Role.ADMIN, Role.MODERATOR)).toBe(false);
  });

  it('handles users without assigned roles', () => {
    expect(hasRole(undefined, Role.ADMIN)).toBe(false);
  });

  it('recognizes curator as an independent editorial role', () => {
    expect(hasRole(Role.CURATOR, Role.CURATOR)).toBe(true);
    expect(hasRole(Role.CURATOR, Role.MODERATOR)).toBe(false);
    expect(hasAnyRole(Role.CURATOR, Role.CURATOR, Role.ADMIN)).toBe(true);
  });

  it('recognizes administrator authority across editorial and moderation capabilities', () => {
    expect(hasEditorialAuthority(Role.ADMIN)).toBe(true);
    expect(hasModerationAuthority(Role.ADMIN)).toBe(true);
    expect(hasEditorialAuthority(Role.MODERATOR)).toBe(false);
    expect(hasModerationAuthority(Role.CURATOR)).toBe(false);
  });
});
