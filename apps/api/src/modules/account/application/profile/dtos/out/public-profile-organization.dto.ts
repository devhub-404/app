import { ApiProperty } from '@nestjs/swagger';
export class PublicProfileOrganizationDTO {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() type!: string;
  @ApiProperty({ type: String, nullable: true }) avatarUrl!: string | null;
  @ApiProperty({ enum: ['owner', 'admin', 'member'] }) membershipRole!: 'owner' | 'admin' | 'member';
}
