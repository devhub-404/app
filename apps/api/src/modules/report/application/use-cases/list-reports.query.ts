import { Injectable } from '@nestjs/common';
import type { ReportStatus } from '@/modules/report/domain';
import { ReportRepository } from '../ports/report.repository';

@Injectable()
export class ListResourceReportsQuery {
  constructor(private readonly reports: ReportRepository) {}
  async execute(status: ReportStatus = 'pending') {
    return (await this.reports.listResources(status)).map((report) => report.value);
  }
}

@Injectable()
export class ListCommentReportsQuery {
  constructor(private readonly reports: ReportRepository) {}
  async execute(status: ReportStatus = 'pending') {
    return (await this.reports.listComments(status)).map((report) => report.value);
  }
}
