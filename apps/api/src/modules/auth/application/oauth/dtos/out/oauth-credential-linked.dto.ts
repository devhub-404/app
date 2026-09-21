import { ApiProperty } from '@nestjs/swagger';

export class OAuthCredentialLinkedDTO {
  @ApiProperty()
  credentialId!: string;
}
