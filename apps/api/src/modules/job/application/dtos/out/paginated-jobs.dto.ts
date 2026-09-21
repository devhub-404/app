import { ApiProperty } from '@nestjs/swagger';
import { JobDTO } from './job.dto';

export class PaginatedJobsDTO {
  @ApiProperty({ type: JobDTO, isArray: true })
  items!: JobDTO[];

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty()
  total!: number;
}
