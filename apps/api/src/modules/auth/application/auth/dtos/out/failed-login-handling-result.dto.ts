import { ApiProperty } from '@nestjs/swagger';

export class FailedLoginHandlingResultDTO {
  @ApiProperty()
  counted!: boolean;

  @ApiProperty()
  locked!: boolean;

  @ApiProperty()
  failedAttempts!: number;

  @ApiProperty({ required: false, nullable: true })
  lockedUntil?: Date | null;
}
