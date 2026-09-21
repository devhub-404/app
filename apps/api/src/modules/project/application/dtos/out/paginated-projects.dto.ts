import { ApiProperty } from '@nestjs/swagger';
import { ProjectDTO } from './project.dto';

export class PaginatedProjectsDTO {
  @ApiProperty({ type: ProjectDTO, isArray: true })
  items!: ProjectDTO[];

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty()
  total!: number;
}
