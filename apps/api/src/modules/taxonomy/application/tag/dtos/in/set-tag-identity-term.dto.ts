import { Transform } from 'class-transformer';
import { IsIn, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { TagIdentityTermKind } from '@/modules/taxonomy/application/tag/ports/tag-identity.repository';

export class SetTagIdentityTermDTO {
  @ApiProperty({ example: 'official' })
  @IsString()
  @MaxLength(64)
  @Transform(({ value }: { value: string }) => value?.trim())
  value!: string;

  @ApiProperty({ enum: ['reserved', 'blocked'] })
  @IsIn(['reserved', 'blocked'])
  kind!: TagIdentityTermKind;
}
