import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MfaTotpVerifyDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  code!: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  deviceName?: string;
}
