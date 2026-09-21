import { ApiHideProperty } from '@nestjs/swagger';
import { IsIP, IsObject, IsOptional, IsString } from 'class-validator';
import { CompletePasskeyLoginDTO } from './complete-passkey-login.dto';
import { CompletePasskeyRegistrationDTO } from './complete-passkey-registration.dto';

export class StartPasskeyRegistrationInputDTO {
  @ApiHideProperty()
  @IsString()
  userId!: string;

  @ApiHideProperty()
  @IsString()
  sessionId!: string;
}

export class CompletePasskeyRegistrationInputDTO extends CompletePasskeyRegistrationDTO {
  @ApiHideProperty()
  @IsString()
  userId!: string;

  @ApiHideProperty()
  @IsString()
  sessionId!: string;
}

export class CompletePasskeyLoginInputDTO extends CompletePasskeyLoginDTO {
  @ApiHideProperty()
  @IsOptional()
  @IsIP()
  ipAddress?: string | null;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  userAgent?: string | null;
}

export class CompletePasskeyResponseDTO {
  @IsObject()
  response!: Record<string, unknown>;
}
