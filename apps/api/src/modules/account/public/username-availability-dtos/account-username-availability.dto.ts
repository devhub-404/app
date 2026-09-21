import { ApiProperty } from '@nestjs/swagger';

export class AccountUsernameAvailabilityDTO {
  @ApiProperty()
  available!: boolean;
}
