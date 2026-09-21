import { ApiProperty } from '@nestjs/swagger';

export class AccountEmailDTO {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  accountId!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: ['primary', 'backup'] })
  type!: 'primary' | 'backup';

  @ApiProperty({ type: String, nullable: true })
  verifiedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;
}
