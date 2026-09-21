import { ApiProperty } from '@nestjs/swagger';

/** Public anti-enumeration acknowledgement. */
export class PasswordRegistrationCompletedDTO {
  @ApiProperty({ enum: [true] })
  acknowledged!: true;
}
