import { ApiHideProperty } from '@nestjs/swagger';
import { IsIP, IsOptional, IsString } from 'class-validator';
import { PasswordChangeCompleteDTO } from './password-change-complete.dto';
import { PasswordChangeStartDTO } from './password-change-start.dto';
import { PasswordLoginFinishDTO } from './password-login-finish.dto';
import { PasswordLoginStartDTO } from './password-login-start.dto';
import { PasswordRegisterFinishDTO } from './password-register-finish.dto';
import { PasswordRegisterStartDTO } from './password-register-start.dto';
import { PasswordCredentialCreateCompleteDTO } from './password-credential-create-complete.dto';
import { PasswordCredentialCreateStartDTO } from './password-credential-create-start.dto';
import { PasswordRecoverCompleteDTO } from './password-recover-complete.dto';
import { PasswordRecoverPrepareDTO } from './password-recover-prepare.dto';
import { PasswordRecoverStartDTO } from './password-recover-start.dto';

export class StartPasswordRegistrationInputDTO extends PasswordRegisterStartDTO {}

export class CompletePasswordRegistrationInputDTO extends PasswordRegisterFinishDTO {
  @ApiHideProperty()
  @IsOptional()
  @IsIP()
  ipAddress?: string | null;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  userAgent?: string | null;
}

export class StartPasswordLoginInputDTO extends PasswordLoginStartDTO {}

export class CompletePasswordLoginInputDTO extends PasswordLoginFinishDTO {
  @ApiHideProperty()
  @IsOptional()
  @IsIP()
  ipAddress?: string | null;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  userAgent?: string | null;
}

export class StartPasswordChangeInputDTO extends PasswordChangeStartDTO {
  @ApiHideProperty()
  @IsString()
  userId!: string;

  @ApiHideProperty()
  @IsString()
  sessionId!: string;
}

export class CompletePasswordChangeInputDTO extends PasswordChangeCompleteDTO {
  @ApiHideProperty()
  @IsString()
  userId!: string;

  @ApiHideProperty()
  @IsString()
  sessionId!: string;
}

export class StartPasswordRecoveryInputDTO extends PasswordRecoverStartDTO {}

export class CompletePasswordRecoveryInputDTO extends PasswordRecoverCompleteDTO {}

export class PreparePasswordRecoveryInputDTO extends PasswordRecoverPrepareDTO {}

export class StartPasswordCredentialCreationInputDTO extends PasswordCredentialCreateStartDTO {
  @ApiHideProperty()
  @IsString()
  userId!: string;

  @ApiHideProperty()
  @IsString()
  sessionId!: string;
}

export class CompletePasswordCredentialCreationInputDTO extends PasswordCredentialCreateCompleteDTO {
  @ApiHideProperty()
  @IsString()
  userId!: string;

  @ApiHideProperty()
  @IsString()
  sessionId!: string;
}
