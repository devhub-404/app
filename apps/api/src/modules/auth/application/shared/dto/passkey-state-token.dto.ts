import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { JwtTokenType } from './jwt-token-type';

export class PasskeyStateTokenDTO {
  @IsString()
  @ApiProperty({ enum: ['login', 'register'] })
  action!: 'login' | 'register';

  @IsString()
  @ApiProperty()
  challenge!: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ required: false })
  userId?: string;

  @IsIn([JwtTokenType.PASSKEY_STATE])
  @ApiProperty({ enum: [JwtTokenType.PASSKEY_STATE] })
  type!: JwtTokenType.PASSKEY_STATE;
}
