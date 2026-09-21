import { describe, expect, it } from 'vitest';
import { AppError } from '@/shared/errors/app-error';
import { AssignAccountRolesCommand } from '@/modules/account/application/admin/use-cases/command/assign-user-roles.command';

function account(mfaEnabled: boolean) {
  return {
    id: 'account-1',
    status: 'active' as const,
    mfaEnabled,
    lockedUntil: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('AssignAccountRolesCommand', () => {
  it('persists privileged roles independently of MFA enrollment', async () => {
    let persistedRoles: string[] = [];
    const command = new AssignAccountRolesCommand(
      { findById: async () => account(false) } as never,
      {
        findByName: async (name: string) => ({ id: `role-${name}`, name }),
        findNameByUserId: async () => null,
        replaceUserRole: async (_accountId: string, roleId: string | null) => {
          persistedRoles = roleId ? [roleId] : [];

          return true;
        },
      } as never,
    );

    await expect(command.execute('account-1', 'moderator')).resolves.toEqual({
      userId: 'account-1',
      role: 'moderator',
    });
    expect(persistedRoles).toEqual(['role-moderator']);
  });

  it('accepts Curator as the editorial privileged role', async () => {
    const command = new AssignAccountRolesCommand(
      { findById: async () => account(false) } as never,
      {
        findByName: async (name: string) => ({ id: `role-${name}`, name }),
        findNameByUserId: async () => null,
        replaceUserRole: async () => true,
      } as never,
    );

    await expect(command.execute('account-1', 'curator')).resolves.toEqual({
      userId: 'account-1',
      role: 'curator',
    });
  });

  it('does not persist when any requested role is invalid', async () => {
    let persistCalls = 0;
    const command = new AssignAccountRolesCommand({ findById: async () => account(false) } as never, {
      findByName: async () => null,
      findNameByUserId: async () => null,
      replaceUserRole: async () => {
        persistCalls += 1;

        return true;
      },
    });

    await expect(command.execute('account-1', 'user')).rejects.toThrowError(new AppError('USER_INVALID_ROLE'));
    expect(persistCalls).toBe(0);
  });

  it('fails closed if the Account disappears before the atomic role replacement', async () => {
    const command = new AssignAccountRolesCommand(
      { findById: async () => account(false) } as never,
      {
        findByName: async () => ({ id: 'role-admin', name: 'admin' }),
        findNameByUserId: async () => null,
        replaceUserRole: async () => false,
      } as never,
    );

    await expect(command.execute('account-1', 'admin')).rejects.toThrowError(new AppError('USER_NOT_FOUND'));
  });
});
