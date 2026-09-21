import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CompleteOAuthLinkDTO {
  @IsString()
  @ApiProperty()
  code!: string;

  @IsString()
  @ApiProperty()
  stateToken!: string;
}
