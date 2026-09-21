import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetAccountStandingInputDTO {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  accountId!: string;
}
