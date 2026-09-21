import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsUUID } from 'class-validator';
import { JwtTokenType } from './jwt-token-type';

export class PossessionProofEmailCodeTokenDTO {
  @IsUUID()
  @ApiProperty()
  sub!: string;

  @IsEmail()
  @ApiProperty()
  email!: string;

  @IsIn([JwtTokenType.POSSESSION_PROOF_EMAIL_CODE])
  @ApiProperty({ enum: [JwtTokenType.POSSESSION_PROOF_EMAIL_CODE] })
  type!: JwtTokenType.POSSESSION_PROOF_EMAIL_CODE;
}
