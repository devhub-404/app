import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SyncNotificationsQueryDTO {
  @ApiPropertyOptional({ description: 'Cursor opaco retornado pela sincronização anterior' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  cursor?: string;
}
