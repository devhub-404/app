import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class PasskeyDeviceDTO {
  @IsUUID()
  @ApiProperty()
  credentialId!: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ nullable: true, type: String })
  deviceName!: string | null;

  @IsString()
  @ApiProperty()
  deviceType!: string;

  @IsBoolean()
  @ApiProperty()
  backedUp!: boolean;

  @IsOptional()
  @ApiProperty({ nullable: true, type: [String] })
  transports!: string[] | null;

  @IsDate()
  @ApiProperty()
  createdAt!: Date;

  @IsDate()
  @ApiProperty()
  updatedAt!: Date;

  @IsOptional()
  @IsDate()
  @ApiProperty({ nullable: true, type: Date })
  lastUsedAt!: Date | null;
}
