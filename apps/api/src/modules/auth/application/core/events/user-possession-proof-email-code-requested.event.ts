export const USER_POSSESSION_PROOF_EMAIL_CODE_REQUESTED_EVENT = 'auth.user.possession.proof.email-code.requested';

export class UserPossessionProofEmailCodeRequestedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly code: string,
  ) {}
}
