import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { ReportStatus } from '@/modules/report/domain';

const REPORT_STATUSES = ['pending', 'resolved', 'dismissed'] as const satisfies readonly ReportStatus[];

export class ListReportsQueryDTO {
  @ApiPropertyOptional({ enum: REPORT_STATUSES })
  @IsOptional()
  @IsIn(REPORT_STATUSES)
  status?: ReportStatus;
}
