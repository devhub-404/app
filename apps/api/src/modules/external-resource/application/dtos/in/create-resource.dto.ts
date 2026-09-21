import { ArrayMaxSize, ArrayMinSize, IsArray, IsString, IsUrl, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResourceDTO {
  @ApiProperty()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  title!: string;

  @ApiProperty()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  description!: string;

  @ApiProperty()
  @IsUrl()
  @Transform(({ value }: { value: string }) => value?.trim())
  url!: string;

  @ApiProperty({ type: [String], minItems: 0, maxItems: 5 })
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    each: true,
    message: 'tagSlugs must be lower-case hyphenated strings',
  })
  @Transform(({ value }: { value: string[] }) => (Array.isArray(value) ? value.map((tag) => tag.trim()) : value))
  tagSlugs!: string[];
}
