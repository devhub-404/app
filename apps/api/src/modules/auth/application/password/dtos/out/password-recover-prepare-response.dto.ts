import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PasswordRecoverPrepareResponseDTO {
  @IsString()
  @ApiProperty()
  registrationResponse!: string;
}
