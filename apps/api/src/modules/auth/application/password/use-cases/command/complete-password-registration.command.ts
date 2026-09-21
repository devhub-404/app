import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OpaquePasswordService } from '@/modules/auth/domain/services/opaque-password.service';
import { AccountAccessPort } from '@/modules/auth/application/password/ports/user.repository';
import { CredentialRepository } from '@/modules/auth/application/password/ports/credential.repository';
import { StartEmailVerificationCommand } from '@/modules/auth/application/emails/use-cases/command/start-email-verification.command';
import { PasswordRegistrationCompletedDTO } from '@/modules/auth/application/password/dtos/out';
import { ACCOUNT_CREATED_EVENT, AccountCreatedEvent } from '@/modules/account/public/events';
import { assertEmailAddressCanBeUsedForIdentity } from '@/modules/auth/application/shared/email-address-policy';
import { UnitOfWork } from '@/shared/kernel/services/unit-of-work';
import { CompletePasswordRegistrationInputDTO } from '@/modules/auth/application/password/dtos';

@Injectable()
export class CompletePasswordRegistrationCommand {
  constructor(
    private readonly opaquePasswordService: OpaquePasswordService,
    private readonly userRepository: AccountAccessPort,
    private readonly credentialRepository: CredentialRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly startEmailVerifyCommand: StartEmailVerificationCommand,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: CompletePasswordRegistrationInputDTO): Promise<PasswordRegistrationCompletedDTO> {
    // 1. Reject temporary addresses before doing any identity write.
    assertEmailAddressCanBeUsedForIdentity(input.email);

    // 2. Validate the registration record before consulting account existence so
    // an already-registered address does not get a cheaper public protocol path.
    await this.opaquePasswordService.getServerPublicKey(input.registrationRecord);

    // Registration is deliberately acknowledgement-only. Existing identities
    // take the same successful response shape instead of exposing enumeration.
    if (await this.userRepository.findByEmail(input.email)) return { acknowledged: true };

    // 3. Account provisioning and its initial Auth credential are both required
    // local facts of a successful signup. While the owners share PostgreSQL,
    // commit them in one short request-local UnitOfWork.
    let userId: string | null;
    try {
      userId = await this.unitOfWork.run(async () => {
        const raced = await this.userRepository.findByEmail(input.email);
        if (raced) return null;

        const createdUserId = await this.userRepository.create({
          email: input.email,
          emailVerifiedAt: null,
        });
        await this.credentialRepository.createPassword({
          userId: createdUserId,
          verifier: input.registrationRecord,
          opaqueUserIdentifier: input.opaqueUserIdentifier,
        });

        return createdUserId;
      });
    } catch (error) {
      if (isUniqueConstraintViolation(error)) return { acknowledged: true };

      throw error;
    }

    if (!userId) return { acknowledged: true };

    // Account + primary email + Profile + Preferences + initial Credential have committed.
    this.eventEmitter.emit(ACCOUNT_CREATED_EVENT, new AccountCreatedEvent(userId));

    // 9. Send verification email
    await this.startEmailVerifyCommand.execute(userId);

    return { acknowledged: true };
  }
}

function isUniqueConstraintViolation(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 3 && current && typeof current === 'object'; depth += 1) {
    if ((current as { code?: unknown }).code === '23505') return true;
    current = (current as { cause?: unknown }).cause;
  }

  return false;
}
