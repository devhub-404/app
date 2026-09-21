import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { IsUUID } from '@/shared/utils/validators';

export class CreateCommentDTO {
  @IsOptional()
  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  @Transform(({ value }: { value: string }) => value?.trim())
  parentId?: string;

  @ApiProperty()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  content!: string;
}
