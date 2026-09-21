import { ApiProperty } from '@nestjs/swagger';
import { ProfileDTO } from './profile.dto';
import { PublicProfileContributionDTO } from './public-profile-contribution.dto';
import { PublicProfileOrganizationDTO } from './public-profile-organization.dto';

export class PublicProfileDTO extends ProfileDTO {
  @ApiProperty({ type: [PublicProfileContributionDTO] })
  contributions!: PublicProfileContributionDTO[];
  @ApiProperty({ type: [PublicProfileOrganizationDTO] })
  organizations!: PublicProfileOrganizationDTO[];
}
