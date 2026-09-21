import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetProfileByUsernameQueryDTO {
  @ApiProperty()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  username!: string;
}
