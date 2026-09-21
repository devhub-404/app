import { ApiProperty } from '@nestjs/swagger';

export class AuthenticationMethodDTO {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ['local', 'google', 'github', 'passkey'] })
  provider!: 'local' | 'google' | 'github' | 'passkey';

  @ApiProperty({ type: String, nullable: true })
  providerEmail!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  canRemove!: boolean;
}
