import { ApiProperty } from '@nestjs/swagger';

export class PasskeyRegisteredDTO {
  @ApiProperty()
  credentialId!: string;
}
