import { ApiProperty } from '@nestjs/swagger';

export class PasswordCredentialCreatedDTO {
  @ApiProperty()
  credentialId!: string;
}
