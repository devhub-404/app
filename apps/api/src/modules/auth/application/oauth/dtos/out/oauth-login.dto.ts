import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class OAuthLoginDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  mfaRequired?: true;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  token?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsString({ each: true })
  methods?: string[];

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  reactivationToken?: string;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  restoreAccessRequested?: true;
}
