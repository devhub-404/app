import { ApiHideProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendPossessionProofEmailCodeInputDTO {
  @ApiHideProperty() @IsString() userId!: string;
}

export class RestoreAccessEmailInputDTO {
  @ApiHideProperty() @IsString() userId!: string;
  @ApiHideProperty() @IsString() email!: string;
}
