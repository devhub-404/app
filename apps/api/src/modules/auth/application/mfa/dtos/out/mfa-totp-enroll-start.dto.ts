import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class MfaTotpEnrollStartDTO {
  @IsString()
  @ApiProperty()
  secret!: string;

  @IsString()
  @ApiProperty()
  otpauthUri!: string;

  @IsIn(['pending'])
  @ApiProperty({ enum: ['pending'] })
  status!: 'pending';
}
