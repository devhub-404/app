import { describe, expect, it } from 'vitest';
import { IssueSessionCommand } from '@/modules/auth/application/sessions/use-cases/command/issue-session.command';
import { RevokeSessionByIdCommand } from '@/modules/auth/application/sessions/use-cases/command/revoke-session-by-id.command';
import { AppError } from '@/shared/errors/app-error';
import { Session } from '@/modules/auth/domain/entities/session';

const account = (overrides: Record<string, unknown> = {}) => ({
  userId: 'user-1',
  voluntaryStatus: 'active' as const,
  moderationStatus: 'none' as const,
  deletionStatus: 'none' as const,
  deletionRequestedAt: null,
  status: 'active' as const,
  mfaEnabled: false,
  lockedUntil: null,
  deletedAt: null,
  primaryEmailVerified: true,
  backupEmailVerified: false,
  role: null,
  ...overrides,
});

describe('Session use cases', () => {
  it('issues a session secret after authentication eligibility checks', async () => {
    let input: Record<string, unknown> | undefined;
    const command = new IssueSessionCommand(
      {
        createSessionWithTokens: async (value: Record<string, unknown>) => {
          input = value;

          return { sessionSecret: 'opaque' };
        },
      } as never,
      { getAuthenticationView: async () => account() } as never,
    );

    await expect(command.execute({ userId: 'user-1', authMethod: 'password' })).resolves.toEqual({
      sessionSecret: 'opaque',
    });
    expect(input).toMatchObject({ userId: 'user-1', authMethod: 'password' });
  });

  it('does not issue a session before MFA', async () => {
    const command = new IssueSessionCommand(
      { createSessionWithTokens: async () => ({ sessionSecret: 'opaque' }) } as never,
      { getAuthenticationView: async () => account({ mfaEnabled: true }) } as never,
    );

    await expect(command.execute({ userId: 'user-1', authMethod: 'password' })).rejects.toThrowError(
      new AppError('AUTH_REQUIRED'),
    );
  });

  it('revokes only the requested active session', async () => {
    const calls: string[] = [];
    const session = Session.create('session-1', {
      userId: 'user-1',
      authMethod: 'password',
      sessionSecretHash: 'hash',
      expiresAt: new Date(Date.now() + 60_000),
    });
    await new RevokeSessionByIdCommand({
      findActiveAggregateById: async () => session,
      saveAggregate: async (aggregate: Session) => {
        calls.push(aggregate.id);

        return true;
      },
    } as never).execute('user-1', 'session-1');
    expect(calls).toEqual(['session-1']);
  });
});
