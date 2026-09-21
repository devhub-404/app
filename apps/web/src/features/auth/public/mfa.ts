export { verifyMfaRecoveryCode, verifyMfaTotp } from '../actions/auth.action.ts';

export type {
  MfaConfigurationDTO as MfaConfiguration,
  MfaDisableDTO as MfaDisableInput,
  MfaRecoveryCodesDTO as MfaRecoveryCodes,
  MfaTotpEnrollCompleteResponseDTO as TotpEnrollmentCompleteResult,
  MfaTotpEnrollStartDTO as TotpEnrollment,
  PossessionProofStartedDTO as PossessionProofStarted,
} from '../types/auth.type.ts';
