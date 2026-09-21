import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  RESTRICTION_CAPABILITIES,
  type RestrictionCapability,
} from '@/modules/moderation/public/account-restriction.port';

export class AccountRestrictionDTO {
  @ApiProperty() id!: string;
  @ApiProperty() accountId!: string;
  @ApiProperty({ enum: RESTRICTION_CAPABILITIES }) capability!: RestrictionCapability;
  @ApiProperty() reason!: string;
  @ApiProperty() startsAt!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) endsAt!: string | null;
  @ApiProperty() appliedByAccountId!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) revokedAt!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) revokedByAccountId!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) revokeReason!: string | null;
  @ApiProperty() createdAt!: string;
}
