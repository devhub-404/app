import { IsString, Matches, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDTO {
  @ApiProperty()
  @IsString()
  @MaxLength(32)
  @Transform(({ value }: { value: string }) => value?.trim())
  name!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(32)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug must be a lower-case hyphenated string' })
  @Transform(({ value }: { value: string }) => value?.trim())
  slug!: string;
}
