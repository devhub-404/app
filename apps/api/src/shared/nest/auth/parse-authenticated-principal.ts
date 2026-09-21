import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AuthenticatedPrincipal } from './authenticated-principal';

export function parseAuthenticatedPrincipal(payload: unknown): AuthenticatedPrincipal {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid token payload');
  }

  const principal = plainToInstance(AuthenticatedPrincipal, payload);
  const errors = validateSync(principal, { forbidUnknownValues: true });
  if (errors.length > 0) throw new Error('Invalid token payload');

  return principal;
}
