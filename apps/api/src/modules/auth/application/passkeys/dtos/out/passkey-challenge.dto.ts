import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class PasskeyChallengeDTO {
  @IsObject()
  @ApiProperty({ type: 'object', additionalProperties: true })
  options!: Record<string, unknown>;

  @IsString()
  @ApiProperty()
  stateToken!: string;
}
