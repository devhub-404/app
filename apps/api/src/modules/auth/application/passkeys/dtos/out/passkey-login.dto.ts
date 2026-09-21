import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PasskeyLoginDTO {
  @IsOptional()
  @ApiProperty({ required: false })
  mfaRequired?: true;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  token?: string;

  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({ required: false, type: [String] })
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
