import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class AccountPurgeInputDTO {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiPropertyOptional()
  now?: Date;
}
