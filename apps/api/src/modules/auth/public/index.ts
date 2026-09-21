export { PossessionProofService } from '@/modules/auth/public/possession-proof.service';
export {
  PossessionProofServicePort,
  POSSESSION_PROOF_SERVICE,
} from '@/modules/auth/public/possession-proof.service.port';
export { AuthPublicModule } from './auth-public.module';

export { AuthenticatedPrincipalDTO, GenericPublicAckDTO, parseJwtPayload, AuthGuard, User } from './http';

export { SessionAccessValidationPort } from './session-access-validation.port';
export { AUTH_CONFIG, type AuthConfig } from './auth-config.port';
export type { OAuthProviderName } from './oauth';
export { PurgeExpiredAuthArtifactsCommand } from '../application/auth/use-cases/command/purge-expired-auth-artifacts.command';
