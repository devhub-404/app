import type { AuthenticatedPrincipal } from '@/shared/nest/auth';

export abstract class SessionAccessValidationPort {
  abstract resolve(sessionSecret: string): Promise<AuthenticatedPrincipal | null>;
}
