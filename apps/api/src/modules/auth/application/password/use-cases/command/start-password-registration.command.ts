import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { OpaquePasswordService } from '@/modules/auth/domain/services/opaque-password.service';
import { assertEmailAddressCanBeUsedForIdentity } from '@/modules/auth/application/shared/email-address-policy';
import { PasswordRegisterStartResponseDTO, StartPasswordRegistrationInputDTO } from '@/modules/auth/application/password/dtos';

@Injectable()
export class StartPasswordRegistrationCommand {
  constructor(private readonly opaquePasswordService: OpaquePasswordService) {}

  async execute(input: StartPasswordRegistrationInputDTO): Promise<PasswordRegisterStartResponseDTO> {
    assertEmailAddressCanBeUsedForIdentity(input.email);

    // Do not query identity existence here. Public registration must expose the
    // same OPAQUE ceremony shape for registered and unregistered addresses.
    // CompletePasswordRegistrationCommand owns the authoritative uniqueness check.
    const opaqueUserIdentifier = randomUUID();
    const { registrationResponse } = await this.opaquePasswordService.createRegistrationResponse({
      userIdentifier: opaqueUserIdentifier,
      registrationRequest: input.registrationRequest,
    });

    return { registrationResponse, opaqueUserIdentifier };
  }
}
