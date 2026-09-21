import { ApiProperty } from '@nestjs/swagger';

export class AuthorDTO {
  @ApiProperty()
  username!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty()
  avatarUrl!: string;
}
