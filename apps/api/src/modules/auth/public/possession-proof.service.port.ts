export type PossessionProofRequirement = { accepted: boolean; required: boolean };
export type PossessionProofAssurance = 'standard' | 'current' | 'mfa';

export abstract class PossessionProofServicePort {
  abstract requirePossessionProof(
    userId: string,
    sessionId: string,
    emailCode?: string | null,
    requiredAssurance?: PossessionProofAssurance,
  ): Promise<PossessionProofRequirement>;
}

export const POSSESSION_PROOF_SERVICE = 'POSSESSION_PROOF_SERVICE';
