import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export class CreateAnswerDTO {
  @ApiProperty()
  @IsString()
  @MinLength(4)
  @MaxLength(FIELD_LIMITS.body)
  content!: string;
}
