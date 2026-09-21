import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class MagicLinkLoginDTO {
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
  @IsString()
  @ApiProperty({ required: false, nullable: true })
  redirect?: string | null;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  restoreAccessRequested?: true;
}
