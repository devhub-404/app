import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AccountDeletionRestoreAccessDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  token!: string;
}
