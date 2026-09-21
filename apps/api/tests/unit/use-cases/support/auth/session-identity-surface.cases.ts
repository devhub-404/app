import { afterEach, describe, expect, it, vi } from 'vitest';
import { EvaluatePossessionProofRequirementQuery } from '@/modules/auth/application/auth/use-cases/query/evaluate-possession-proof-requirement.query';
import { GetCurrentSessionQuery } from '@/modules/auth/application/sessions/use-cases/query/get-current-session.query';
import { GetCurrentUserQuery } from '@/modules/auth/application/auth/use-cases/query/get-current-user.query';
import { GetMyMfaConfigurationQuery } from '@/modules/auth/application/mfa/use-cases/query/get-my-mfa-configuration.query';
import { ListMySessionsQuery } from '@/modules/auth/application/sessions/use-cases/query/list-my-sessions.query';
import { ListPasskeyDevicesQuery } from '@/modules/auth/application/passkeys/use-cases/query/list-passkey-devices.query';
import { PurgeExpiredAuthArtifactsCommand } from '@/modules/auth/application/auth/use-cases/command/purge-expired-auth-artifacts.command';
import { RequirePossessionProofCommand } from '@/modules/auth/application/auth/use-cases/command/require-possession-proof.command';
import { RevokeAllSessionsCommand } from '@/modules/auth/application/sessions/use-cases/command/revoke-all-sessions.command';
import { RevokeCurrentSessionCommand } from '@/modules/auth/application/sessions/use-cases/command/revoke-current-session.command';
import { RevokeOtherSessionsCommand } from '@/modules/auth/application/sessions/use-cases/command/revoke-other-sessions.command';
import { SendPossessionProofEmailCodeCommand } from '@/modules/auth/application/auth/use-cases/command/send-possession-proof-email-code.command';
import { Session } from '@/modules/auth/domain/entities/session';

afterEach(() => vi.useRealTimers());

describe('Auth session, MFA and possession-proof application surface', () => {
  it('AUTH-BE-UC-019/036 — proof evaluation reports requirement; required standard proof requests an email code only when no proof is accepted', async () => {
    const verify = { execute: vi.fn(async () => ({ accepted: false })) };
    const evaluate = new EvaluatePossessionProofRequirementQuery(verify as never);
    await expect(evaluate.execute('user-1', 'session-1')).resolves.toEqual({ accepted: false, required: true });
    expect(verify.execute).toHaveBeenCalledWith('user-1', 'session-1', { requiredAssurance: 'current' });

    const send = { execute: vi.fn(async () => ({ sent: true })) };
    const requireProof = new RequirePossessionProofCommand(verify as never, send as never);
    await expect(requireProof.execute('user-1', 'session-1', undefined, 'standard')).rejects.toMatchObject({
      code: 'AUTH_REQUIRED',
    });
    expect(send.execute).toHaveBeenCalledWith({ userId: 'user-1' });

    verify.execute.mockResolvedValue({ accepted: true });
    await expect(requireProof.execute('user-1', 'session-1', undefined, 'current')).resolves.toEqual({
      accepted: true,
      required: false,
    });
  });

  it('AUTH-BE-UC-020/030 — current Session and Session inventory read only active records scoped to the Account', async () => {
    const session = { id: 'session-1', userId: 'user-1', revokedAt: null, expiresAt: '2030-01-01T00:00:00.000Z' };
    const findActiveById = vi.fn(async () => session);
    const findActiveByUserId = vi.fn(async () => [session]);
    const repository = { findActiveById, findActiveByUserId } as never;
    await expect(new GetCurrentSessionQuery(repository).execute('user-1', 'session-1')).resolves.toBe(session);
    await expect(new ListMySessionsQuery(repository).execute('user-1')).resolves.toEqual({ items: [session] });
    expect(findActiveById).toHaveBeenCalledWith('user-1', 'session-1');
    expect(findActiveByUserId).toHaveBeenCalledWith('user-1');
  });

  it('AUTH-BE-UC-021 — current user projection is bound to both Account and current Session and fails closed if either no longer resolves', async () => {
    const me = { id: 'user-1', role: null };
    const findByUserIdAndSessionId = vi.fn(async () => me);
    const query = new GetCurrentUserQuery({ findByUserIdAndSessionId } as never);
    await expect(query.execute({ userId: 'user-1', sessionId: 'session-1' })).resolves.toBe(me);
    findByUserIdAndSessionId.mockResolvedValue(null);
    await expect(query.execute({ userId: 'user-1', sessionId: 'revoked' })).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
    });
  });

  it('AUTH-BE-UC-022 — MFA configuration derives enabled/enrolled status and remaining recovery codes from current artifacts', async () => {
    const findByUserId = vi.fn(async () => ({ userId: 'user-1', status: 'active' }));
    const listByUserId = vi.fn(async () => [
      { codeHash: 'a', usedAt: null },
      { codeHash: 'b', usedAt: '2026-08-01T00:00:00.000Z' },
      { codeHash: 'c', usedAt: null },
    ]);
    await expect(
      new GetMyMfaConfigurationQuery({ findByUserId } as never, { listByUserId } as never).execute('user-1'),
    ).resolves.toEqual({
      enabled: true,
      totpEnrolled: true,
      totpStatus: 'active',
      recoveryCodesRemaining: 2,
    });
  });

  it('AUTH-BE-UC-031 — passkey inventory exposes device metadata but not key material/counters', async () => {
    const device = {
      credentialId: 'credential-1',
      deviceName: 'Laptop',
      deviceType: 'multiDevice',
      backedUp: true,
      transports: ['internal'],
      createdAt: '2026-08-01',
      updatedAt: '2026-08-02',
      lastUsedAt: '2026-08-03',
      publicKey: 'must-not-leak',
      counter: 42,
    };
    const result = await new ListPasskeyDevicesQuery({ listByUserId: vi.fn(async () => [device]) } as never).execute(
      'user-1',
    );
    expect(result).toEqual([
      {
        credentialId: 'credential-1',
        deviceName: 'Laptop',
        deviceType: 'multiDevice',
        backedUp: true,
        transports: ['internal'],
        createdAt: '2026-08-01',
        updatedAt: '2026-08-02',
        lastUsedAt: '2026-08-03',
      },
    ]);
    expect(result[0]).not.toHaveProperty('publicKey');
    expect(result[0]).not.toHaveProperty('counter');
  });

  it('AUTH-BE-UC-033 — scheduled purge uses retention for Sessions and current expiry for flow proofs, then returns the combined deletion count', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-30T00:00:00.000Z'));
    const deleteExpiredBefore = vi.fn(async () => 3);
    const deleteFlowProofs = vi.fn(async () => 2);
    const command = new PurgeExpiredAuthArtifactsCommand(
      { deleteExpiredBefore } as never,
      { deleteExpiredBefore: deleteFlowProofs } as never,
    );
    await expect(command.execute()).resolves.toBe(5);
    expect(deleteExpiredBefore).toHaveBeenCalledWith(new Date('2026-07-31T00:00:00.000Z'));
    expect(deleteFlowProofs).toHaveBeenCalledWith(new Date('2026-08-30T00:00:00.000Z'));
  });

  it('AUTH-BE-UC-039/040/041 — revoke all/current/others have distinct scopes and current revoke is idempotent when already gone', async () => {
    const revokeByUserId = vi.fn(async () => undefined);
    const revokeOthersByUserId = vi.fn(async () => undefined);
    const saveAggregate = vi.fn(async () => true);
    const sessions = { revokeByUserId, revokeOthersByUserId, saveAggregate } as never;
    await new RevokeAllSessionsCommand(sessions).execute('user-1');
    await new RevokeOtherSessionsCommand(sessions).execute('user-1', 'session-current');
    const session = Session.create('session-current', {
      userId: 'user-1',
      authMethod: 'password',
      sessionSecretHash: 'hash',
      expiresAt: new Date(Date.now() + 60_000),
    });
    const findActiveAggregateById = vi.fn(async () => session);
    await new RevokeCurrentSessionCommand({ findActiveAggregateById, saveAggregate } as never).execute(
      'user-1',
      'session-current',
    );
    expect(revokeByUserId).toHaveBeenCalledWith('user-1');
    expect(revokeOthersByUserId).toHaveBeenCalledWith('user-1', 'session-current');
    expect(saveAggregate).toHaveBeenCalledWith(session);
    findActiveAggregateById.mockResolvedValue(null);
    await new RevokeCurrentSessionCommand({ findActiveAggregateById, saveAggregate } as never).execute(
      'user-1',
      'session-current',
    );
    expect(saveAggregate).toHaveBeenCalledTimes(1);
  });

  it('AUTH-BE-UC-043 — possession-proof email code is sent only to active verified non-MFA Account primary email', async () => {
    const authView = {
      userId: 'user-1',
      status: 'active',
      lockedUntil: null,
      deletedAt: null,
      primaryEmailVerified: true,
      mfaEnabled: false,
    };
    const getAuthenticationView = vi.fn(async () => authView);
    const findPrimaryByUserId = vi.fn(async () => ({ userId: 'user-1', email: 'user@example.com' }));
    const findByEmail = vi.fn(async () => ({
      userId: 'user-1',
      email: 'user@example.com',
      type: 'primary',
      verifiedAt: '2026-08-01T00:00:00.000Z',
    }));
    const signSingleUseCode = vi.fn(async () => '123456');
    const emitAsync = vi.fn(async () => []);
    const command = new SendPossessionProofEmailCodeCommand(
      { getAuthenticationView } as never,
      { findPrimaryByUserId, findByEmail } as never,
      { signSingleUseCode } as never,
      { emitAsync } as never,
    );
    await expect(command.execute({ userId: 'user-1' })).resolves.toEqual({ sent: true });
    expect(signSingleUseCode).toHaveBeenCalledWith(
      expect.objectContaining({ purpose: 'possession_proof_email_code', subjectId: 'user-1', expiresIn: '10m' }),
    );
    expect(emitAsync).toHaveBeenCalledTimes(1);

    getAuthenticationView.mockResolvedValue({ ...authView, mfaEnabled: true });
    await expect(command.execute({ userId: 'user-1' })).resolves.toEqual({ sent: false, mfaRequired: true });
    expect(signSingleUseCode).toHaveBeenCalledTimes(1);
  });
});
