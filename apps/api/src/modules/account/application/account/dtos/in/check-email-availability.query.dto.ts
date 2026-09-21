import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class CheckEmailAvailabilityQueryDTO {
  @IsEmail()
  @Transform(({ value }: { value: string }) => value?.trim())
  @ApiProperty()
  email!: string;
}
