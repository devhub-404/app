import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';
import { JOB_TYPES, WORKPLACE_TYPES, COMP_UNITS, TAG_SLUG } from '../dto.constants';

export class UpdateJobDTO {
  @ApiProperty() @IsString() @MinLength(4) @MaxLength(FIELD_LIMITS.title) title!: string;
  @ApiProperty() @IsString() @MinLength(20) @MaxLength(FIELD_LIMITS.body) description!: string;
  @ApiProperty({ enum: JOB_TYPES }) @IsIn(JOB_TYPES) employmentType!: (typeof JOB_TYPES)[number];
  @ApiProperty({ enum: WORKPLACE_TYPES }) @IsIn(WORKPLACE_TYPES) workplaceType!: (typeof WORKPLACE_TYPES)[number];
  @ApiPropertyOptional({ type: String, nullable: true })
  @ValidateIf((value: UpdateJobDTO) => value.workplaceType !== 'remote')
  @IsString()
  @MaxLength(FIELD_LIMITS.location)
  location?: string | null;
  @ApiPropertyOptional({ type: Number, nullable: true }) @IsOptional() @IsNumber() @Min(0.01) compensationMin?:
    number | null;
  @ApiPropertyOptional({ type: Number, nullable: true }) @IsOptional() @IsNumber() @Min(0.01) compensationMax?:
    number | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @IsOptional() @IsString() @Length(3, 3) compensationCurrency?:
    string | null;
  @ApiPropertyOptional({ enum: COMP_UNITS, nullable: true }) @IsOptional() @IsIn(COMP_UNITS) compensationUnit?:
    (typeof COMP_UNITS)[number] | null;
  @ApiProperty()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(FIELD_LIMITS.url)
  applicationUrl!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(FIELD_LIMITS.url)
  sourceUrl?: string | null;
  @ApiProperty({ type: [String], maxItems: 5 })
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @Matches(TAG_SLUG, { each: true })
  tagSlugs!: string[];
}
