import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class OAuthAuthorizationDTO {
  @IsUrl()
  @ApiProperty()
  url!: string;

  @IsString()
  @ApiProperty()
  stateToken!: string;
}
