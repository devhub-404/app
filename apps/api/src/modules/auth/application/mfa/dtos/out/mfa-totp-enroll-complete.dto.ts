import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class MfaTotpEnrollCompleteResponseDTO {
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String] })
  recoveryCodes!: string[];
}
