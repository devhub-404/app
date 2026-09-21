import { AppError } from '@/shared/errors/app-error';

type AuthenticatedAccountState = {
  isDeactivated: boolean;
};

export function assertUserCanAuthenticate(userRow: {
  id: string;
  status: string;
  mfaEnabled: boolean;
  lockedUntil: Date | null;
}): AuthenticatedAccountState {
  if (
    userRow.status === 'suspended' ||
    userRow.status === 'banned' ||
    (userRow.lockedUntil !== null && userRow.lockedUntil.getTime() > Date.now())
  ) {
    throw new AppError('USER_CANNOT_AUTHENTICATE');
  }

  return { isDeactivated: userRow.status === 'deactivated' };
}
