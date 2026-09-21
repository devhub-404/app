import { ApiHideProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IssueSessionResultDTO {
  @ApiHideProperty()
  @IsString()
  sessionSecret!: string;
}
