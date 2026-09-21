import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class SessionOrMfaChallengeDTO {
  @IsOptional()
  @ApiProperty({ required: false, enum: [true] })
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
}
