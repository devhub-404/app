import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';
import { JwtTokenType } from './jwt-token-type';

export class MagicLinkTokenDTO {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  sub?: string;

  @IsEmail()
  @ApiProperty()
  email!: string;

  @IsIn([JwtTokenType.MAGIC_LINK])
  @ApiProperty({ enum: [JwtTokenType.MAGIC_LINK] })
  type!: JwtTokenType.MAGIC_LINK;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, nullable: true })
  redirect?: string | null;
}
