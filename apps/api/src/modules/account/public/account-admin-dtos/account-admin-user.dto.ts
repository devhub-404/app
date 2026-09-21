import { ApiProperty } from '@nestjs/swagger';
import type { AccountRoleName } from '../account-admin.service.port';

export class AccountAdminUserDTO {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: ['active', 'deactivated'] }) voluntaryStatus!: 'active' | 'deactivated';
  @ApiProperty({ enum: ['none', 'suspended', 'banned'] }) moderationStatus!: 'none' | 'suspended' | 'banned';
  @ApiProperty({ enum: ['none', 'pending'] }) deletionStatus!: 'none' | 'pending';
  @ApiProperty({ type: String, format: 'date-time', nullable: true }) deletionRequestedAt!: Date | null;
  @ApiProperty({
    enum: ['active', 'deactivated', 'suspended', 'banned'],
    description: 'Derived compatibility projection',
  })
  status!: 'active' | 'deactivated' | 'suspended' | 'banned';
  @ApiProperty() mfaEnabled!: boolean;
  @ApiProperty({ type: String, format: 'date-time', nullable: true }) lockedUntil!: Date | null;
  @ApiProperty({ nullable: true }) email!: string | null;
  @ApiProperty({ nullable: true }) username!: string | null;
  @ApiProperty({ enum: ['curator', 'admin', 'moderator'], nullable: true }) role!: AccountRoleName | null;
  @ApiProperty() createdAt!: Date;
}
