import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { OpaquePasswordService } from '@/modules/auth/domain/services/opaque-password.service';
import { AccountAccessPort } from '@/modules/auth/application/password/ports/user.repository';
import { CredentialPasswordRepository } from '@/modules/auth/application/password/ports/credential-password.repository';
import { assertUserCanAuthenticate } from '@/modules/auth/application/shared/assert-user-can-authenticate';
import { ACCOUNT_SERVICE, AccountServicePort } from '@/modules/account/public/account.service.port';
import { StartPasswordLoginInputDTO, StartPasswordLoginResultDTO } from '@/modules/auth/application/password/dtos';

@Injectable()
export class StartPasswordLoginCommand {
  constructor(
    private readonly opaquePasswordService: OpaquePasswordService,
    private readonly userRepository: AccountAccessPort,
    private readonly credentialPasswordRepository: CredentialPasswordRepository,
    @Inject(ACCOUNT_SERVICE)
    private readonly accountService: AccountServicePort,
  ) {}

  async execute(input: StartPasswordLoginInputDTO): Promise<StartPasswordLoginResultDTO> {
    const user = await this.userRepository.findByEmail(input.email);
    const authView = user ? await this.accountService.getAuthenticationView(user.userId) : null;
    const credentialPassword = user ? await this.credentialPasswordRepository.findByUserId(user.userId) : null;

    // A real OPAQUE record is safe to use for accounts that may continue to a
    // non-session state (email verification, reactivation or deletion-cancel
    // notice). OPAQUE keeps the start response indistinguishable while still
    // allowing a caller who actually knows the password to prove control.
    let eligible = Boolean(user && authView && credentialPassword);
    if (eligible && authView) {
      try {
        assertUserCanAuthenticate({
          id: authView.userId,
          status: authView.status,
          mfaEnabled: authView.mfaEnabled,
          lockedUntil: authView.lockedUntil,
        });
      } catch {
        eligible = false;
      }
    }
    if (eligible && credentialPassword?.lockedUntil && credentialPassword.lockedUntil > new Date()) eligible = false;

    // OPAQUE supports a null registration record specifically for a synthetic
    // login path. Using it keeps the public start response indistinguishable
    // when the account/credential is absent or currently ineligible.
    const result = await this.opaquePasswordService.startLogin({
      userIdentifier: eligible && credentialPassword ? credentialPassword.opaqueUserIdentifier : randomUUID(),
      registrationRecord: eligible && credentialPassword ? credentialPassword.verifier : null,
      startLoginRequest: input.startLoginRequest,
    });

    return {
      ...result,
      credentialId: eligible && credentialPassword ? credentialPassword.credentialId : null,
    };
  }
}
