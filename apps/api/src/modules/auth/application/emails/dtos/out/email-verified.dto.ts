import { ApiProperty } from '@nestjs/swagger';

export class EmailVerifiedDTO {
  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: ['primary', 'backup'] })
  type!: 'primary' | 'backup';

  @ApiProperty()
  verifiedAt!: Date;
}
