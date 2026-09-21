import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsUUID } from 'class-validator';
import { JwtTokenType } from './jwt-token-type';

export class EmailChangePrimaryTokenDTO {
  @IsUUID()
  @ApiProperty()
  sub!: string;

  @IsEmail()
  @ApiProperty()
  email!: string;

  @IsIn([JwtTokenType.EMAIL_CHANGE_PRIMARY])
  @ApiProperty({ enum: [JwtTokenType.EMAIL_CHANGE_PRIMARY] })
  type!: JwtTokenType.EMAIL_CHANGE_PRIMARY;
}
