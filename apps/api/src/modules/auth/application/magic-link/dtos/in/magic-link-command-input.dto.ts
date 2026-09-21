import { ApiHideProperty } from '@nestjs/swagger';
import { IsIP, IsOptional, IsString } from 'class-validator';
import { CompleteMagicLinkLoginDTO } from './complete-magic-link-login.dto';
import { StartMagicLinkLoginDTO } from './start-magic-link-login.dto';

export class StartMagicLinkLoginInputDTO extends StartMagicLinkLoginDTO {}

export class CompleteMagicLinkLoginInputDTO extends CompleteMagicLinkLoginDTO {
  @ApiHideProperty()
  @IsOptional()
  @IsIP()
  ipAddress?: string | null;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  userAgent?: string | null;
}
