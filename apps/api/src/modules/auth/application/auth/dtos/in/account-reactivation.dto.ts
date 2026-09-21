import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AccountReactivationDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  token!: string;
}
