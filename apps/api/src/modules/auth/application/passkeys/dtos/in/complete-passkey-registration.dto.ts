import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class CompletePasskeyRegistrationDTO {
  @IsString()
  @ApiProperty()
  stateToken!: string;

  @IsObject()
  @ApiProperty({ type: 'object', additionalProperties: true })
  response!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  deviceName?: string;
}
