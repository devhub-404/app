import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsArray, IsOptional, IsString } from 'class-validator';

export class PasswordLoginCompleteDTO {
  @IsOptional()
  @ApiProperty({ required: false })
  mfaRequired?: true;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  token?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ required: false, type: [String] })
  methods?: string[];

  @IsOptional()
  @ApiProperty({ required: false })
  emailVerificationRequested?: true;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  reactivationToken?: string;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  restoreAccessRequested?: true;
}
