import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatePasskeyDeviceNameDTO {
  @IsString()
  @ApiProperty()
  deviceName!: string;
}
