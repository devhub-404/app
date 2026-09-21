import { ApiProperty } from '@nestjs/swagger';
export class AccountSummaryDTO {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: ['active', 'deactivated'] }) voluntaryStatus!: 'active' | 'deactivated';
  @ApiProperty({ enum: ['none', 'suspended', 'banned'] }) moderationStatus!: 'none' | 'suspended' | 'banned';
  @ApiProperty({ enum: ['none', 'pending'] }) deletionStatus!: 'none' | 'pending';
  @ApiProperty({ type: String, nullable: true }) deletionRequestedAt!: Date | null;
  @ApiProperty({
    enum: ['active', 'deactivated', 'suspended', 'banned'],
    description: 'Derived compatibility projection',
  })
  status!: 'active' | 'deactivated' | 'suspended' | 'banned';
  @ApiProperty() mfaEnabled!: boolean;
  @ApiProperty({ type: String, nullable: true }) lockedUntil!: Date | null;
  @ApiProperty({ type: String, nullable: true, deprecated: true }) deletedAt!: Date | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
