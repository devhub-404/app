import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class MfaDisableDTO {
  @IsIn(['totp', 'recovery_code'])
  @ApiProperty({ enum: ['totp', 'recovery_code'] })
  method!: 'totp' | 'recovery_code';

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  code!: string;
}
