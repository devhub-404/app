import { describe, expect, it, vi } from 'vitest';
import { CompleteBackupEmailChangeCommand } from '@/modules/auth/application/emails/use-cases/command/complete-backup-email-change.command';
import { CompleteEmailVerificationCommand } from '@/modules/auth/application/emails/use-cases/command/complete-email-verification.command';
import { CompletePrimaryEmailChangeCommand } from '@/modules/auth/application/emails/use-cases/command/complete-primary-email-change.command';
import { DeleteBackupEmailCommand } from '@/modules/auth/application/emails/use-cases/command/delete-backup-email.command';
import { ResendEmailVerificationCommand } from '@/modules/auth/application/emails/use-cases/command/resend-email-verification.command';
import { StartBackupEmailChangeCommand } from '@/modules/auth/application/emails/use-cases/command/start-backup-email-change.command';
import { StartEmailVerificationCommand } from '@/modules/auth/application/emails/use-cases/command/start-email-verification.command';
import { StartPrimaryEmailChangeCommand } from '@/modules/auth/application/emails/use-cases/command/start-primary-email-change.command';

describe('Auth email ownership and proof flows', () => {
  const userId = 'account-1';
  const primary = {
    id: 'email-primary',
    userId,
    email: 'old@example.com',
    type: 'primary' as const,
    verifiedAt: '2026-08-01T00:00:00.000Z',
  };

  it('AUTH-BE-UC-003 — primary verification accepts only a token matching the current primary email and is idempotent after verification', async () => {
    const payload = { sub: userId, email: 'new@example.com' };
    const verify = vi.fn(async () => payload);
    const setVerifiedAt = vi.fn(async () => undefined);
    const findByEmail = vi.fn(async () => ({ ...primary, email: payload.email, verifiedAt: null }));
    const command = new CompleteEmailVerificationCommand({ verify } as never, { findByEmail, setVerifiedAt } as never);

    const first = await command.execute('signed-token');
    expect(first).toMatchObject({ email: payload.email, type: 'primary', verifiedAt: expect.any(Date) });
    expect(setVerifiedAt).toHaveBeenCalledWith(userId, payload.email, expect.any(Date));

    findByEmail.mockResolvedValue({
      ...primary,
      email: payload.email,
      verifiedAt: '2026-08-20T00:00:00.000Z',
    } as never);
    await expect(command.execute('signed-token')).resolves.toEqual({
      email: payload.email,
      type: 'primary',
      verifiedAt: '2026-08-20T00:00:00.000Z',
    });
    expect(setVerifiedAt).toHaveBeenCalledTimes(1);
  });

  it('AUTH-BE-UC-046/037 — verification start/resend acknowledge silently and emit only for the matching unverified primary email', async () => {
    const sign = vi.fn(async () => 'verification-token');
    const emitAsync = vi.fn(async () => []);
    const repository = {
      findPrimaryByUserId: vi.fn(async () => ({ ...primary, verifiedAt: null })),
      findByEmail: vi.fn(async () => ({ ...primary, verifiedAt: null })),
    };
    await expect(
      new StartEmailVerificationCommand({ sign } as never, repository as never, { emitAsync } as never).execute(userId),
    ).resolves.toEqual({ acknowledged: true });
    await expect(
      new ResendEmailVerificationCommand(repository as never, { sign } as never, { emitAsync } as never).execute(
        ' OLD@example.com ',
      ),
    ).resolves.toEqual({ acknowledged: true });
    expect(sign).toHaveBeenCalledTimes(2);
    expect(emitAsync).toHaveBeenCalledTimes(2);

    repository.findByEmail.mockResolvedValue(null);
    await expect(
      new ResendEmailVerificationCommand(repository as never, { sign } as never, { emitAsync } as never).execute(
        'unknown@example.com',
      ),
    ).resolves.toEqual({ acknowledged: true });
    expect(sign).toHaveBeenCalledTimes(2);
  });

  it.each([
    [
      'primary',
      StartPrimaryEmailChangeCommand,
      CompletePrimaryEmailChangeCommand,
      'email_change_primary',
      'upsertPrimary',
    ],
    ['backup', StartBackupEmailChangeCommand, CompleteBackupEmailChangeCommand, 'email_change_backup', 'upsertBackup'],
  ] as const)(
    'AUTH-BE-UC-045/057/002/014 — %s email change requires fresh proof, sends a single-use proof, consumes it before identity mutation',
    async (_kind, StartCommand, CompleteCommand, purpose, upsertMethod) => {
      const order: string[] = [];
      const requirePossessionProof = vi.fn(async () => {
        order.push('proof');
      });
      const signSingleUse = vi.fn(async (input: any) => {
        order.push(`sign:${input.purpose}`);

        return 'change-token';
      });
      const emitAsync = vi.fn(async () => {
        order.push('emit');

        return [];
      });
      const emailRepository: any = {
        findByEmail: vi.fn(async () => null),
        upsertPrimary: vi.fn(async () => {
          order.push('upsert');
        }),
        upsertBackup: vi.fn(async () => {
          order.push('upsert');
        }),
      };
      const email = `${_kind}@example.com`;
      const start = new StartCommand({ signSingleUse } as never, { emitAsync } as never, emailRepository, {
        requirePossessionProof,
      } as never);
      await expect(start.execute(userId, 'session-1', email)).resolves.toEqual({ acknowledged: true });
      expect(order.slice(0, 3)).toEqual(['proof', `sign:${purpose}`, 'emit']);

      const payload = { sub: userId, email, jti: 'proof-1' };
      const verifySingleUse = vi.fn(async () => payload);
      const consumeSingleUse = vi.fn(async () => {
        order.push('consume');

        return true;
      });
      const complete = new CompleteCommand({ verifySingleUse, consumeSingleUse } as never, emailRepository);
      await expect(complete.execute('change-token')).resolves.toMatchObject({
        email,
        type: _kind,
        verifiedAt: expect.any(Date),
      });
      expect(verifySingleUse).toHaveBeenCalledWith(expect.any(Function), 'change-token', purpose);
      expect(consumeSingleUse).toHaveBeenCalledWith(payload, purpose);
      expect(emailRepository[upsertMethod]).toHaveBeenCalledWith({ userId, email, verifiedAt: expect.any(Date) });
      expect(order.indexOf('consume')).toBeLessThan(order.lastIndexOf('upsert'));
    },
  );

  it('AUTH-BE-UC-002/014 — a replayed or cross-account email-change proof is rejected before identity mutation', async () => {
    const payload = { sub: userId, email: 'taken@example.com', jti: 'proof-1' };
    const upsertPrimary = vi.fn();
    const command = new CompletePrimaryEmailChangeCommand(
      { verifySingleUse: vi.fn(async () => payload), consumeSingleUse: vi.fn(async () => true) } as never,
      {
        findByEmail: vi.fn(async () => ({ ...primary, userId: 'other-account', email: payload.email })),
        upsertPrimary,
      } as never,
    );
    await expect(command.execute('token')).rejects.toMatchObject({ code: 'AUTH_TOKEN_INVALID' });
    expect(upsertPrimary).not.toHaveBeenCalled();
  });

  it('AUTH-BE-UC-016 — deleting backup email requires possession proof before the Account-owned email record is removed', async () => {
    const order: string[] = [];
    const requirePossessionProof = vi.fn(async () => {
      order.push('proof');
    });
    const deleteBackupByUserId = vi.fn(async () => {
      order.push('delete');
    });
    await new DeleteBackupEmailCommand({ deleteBackupByUserId } as never, { requirePossessionProof } as never).execute(
      userId,
      'session-1',
    );
    expect(requirePossessionProof).toHaveBeenCalledWith(userId, 'session-1');
    expect(deleteBackupByUserId).toHaveBeenCalledWith(userId);
    expect(order).toEqual(['proof', 'delete']);
  });
});
