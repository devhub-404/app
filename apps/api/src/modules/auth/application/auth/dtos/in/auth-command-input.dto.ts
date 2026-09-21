import { ApiHideProperty } from '@nestjs/swagger';
import { IsIP, IsIn, IsOptional, IsString } from 'class-validator';
import { AccountReactivationDTO } from './account-reactivation.dto';
import { AccountRecoveryCompleteDTO } from './account-recovery-complete.dto';

const LOGIN_METHODS = ['password', 'magic_link', 'oauth', 'passkey'] as const;

export class HandleAuthenticatedLoginInputDTO {
  @ApiHideProperty() @IsString() userId!: string;
  @ApiHideProperty() @IsString() email!: string;
  @ApiHideProperty() @IsOptional() @IsString() credentialId?: string | null;
  @ApiHideProperty() @IsIn(LOGIN_METHODS) authMethod!: (typeof LOGIN_METHODS)[number];
  @ApiHideProperty() @IsOptional() @IsIP() ipAddress?: string | null;
  @ApiHideProperty() @IsOptional() @IsString() userAgent?: string | null;
  @ApiHideProperty() @IsOptional() @IsString() deviceName?: string | null;
}

export class ReactivateAccountInputDTO extends AccountReactivationDTO {
  @ApiHideProperty() @IsOptional() @IsIP() ipAddress?: string | null;
  @ApiHideProperty() @IsOptional() @IsString() userAgent?: string | null;
}

export class CompleteAccountRecoveryInputDTO extends AccountRecoveryCompleteDTO {}

export class GetCurrentUserInputDTO {
  @ApiHideProperty() @IsString() userId!: string;
  @ApiHideProperty() @IsString() sessionId!: string;
}
