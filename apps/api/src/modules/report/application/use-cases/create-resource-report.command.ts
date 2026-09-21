import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { ResourceReport } from '@/modules/report/domain';
import { ReportRepository } from '../ports/report.repository';
import { ResourceReportTargetAccessService } from '../resource-report-target-access.service';
import { CreateResourceReportInputDTO } from '../dtos/in';
import { ReportCreatedDTO } from '../dtos';

@Injectable()
export class CreateResourceReportCommand {
  constructor(
    private readonly targets: ResourceReportTargetAccessService,
    private readonly reports: ReportRepository,
  ) {}

  async execute(input: CreateResourceReportInputDTO): Promise<ReportCreatedDTO> {
    if (!(await this.targets.isReportable(input.resourceId))) throw new AppError('CONTENT_NOT_FOUND');
    const report = ResourceReport.create(randomUUID(), {
      resourceId: input.resourceId,
      reporterAccountId: input.accountId,
      reason: input.reason,
      description: input.description ?? null,
    });
    await this.reports.createResource(report);

    return { id: report.value.id };
  }
}
