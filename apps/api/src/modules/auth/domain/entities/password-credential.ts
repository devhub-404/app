export class PasswordCredential {
  private constructor(
    readonly id: string,
    readonly userId: string,
    private _verifier: string,
    readonly opaqueUserIdentifier: string,
    readonly failedAttempts: number,
    readonly lockedUntil: Date | null,
  ) {}

  static rehydrate(state: {
    credentialId: string;
    userId: string;
    verifier: string;
    opaqueUserIdentifier: string;
    failedAttempts: number;
    lockedUntil: Date | null;
  }): PasswordCredential {
    return new PasswordCredential(
      state.credentialId,
      state.userId,
      state.verifier,
      state.opaqueUserIdentifier,
      state.failedAttempts,
      state.lockedUntil,
    );
  }

  get verifier(): string {
    return this._verifier;
  }

  replaceVerifier(verifier: string): void {
    this._verifier = verifier;
  }
}
