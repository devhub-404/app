import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AccountUsernameAvailabilityQueryDTO {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  @ApiProperty()
  username!: string;
}
