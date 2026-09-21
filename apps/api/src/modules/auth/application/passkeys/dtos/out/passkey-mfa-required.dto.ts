import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsString } from 'class-validator';

export class PasskeyMfaRequiredDTO {
  @IsBoolean()
  @ApiProperty()
  mfaRequired!: true;

  @IsString()
  @ApiProperty()
  token!: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  methods!: string[];
}
