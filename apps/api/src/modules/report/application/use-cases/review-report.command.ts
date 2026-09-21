import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { ReportRepository } from '../ports/report.repository';
import { ReviewReportDTO } from '../dtos/in/review-report.dto';

@Injectable()
export class ReviewResourceReportCommand {
  constructor(private readonly reports: ReportRepository) {}
  async execute(id: string, reviewerId: string, input: ReviewReportDTO): Promise<void> {
    const report = await this.reports.findResource(id);
    if (!report) throw new AppError('CONTENT_NOT_FOUND');
    const expected = report.value.status;
    if (input.decision === 'resolved') report.resolve(reviewerId, input.note);
    else report.dismiss(reviewerId, input.note);
    if (!(await this.reports.saveResource(report, expected))) throw new AppError('CONTENT_UPDATE_CONFLICT');
  }
}

@Injectable()
export class ReviewCommentReportCommand {
  constructor(private readonly reports: ReportRepository) {}
  async execute(id: string, reviewerId: string, input: ReviewReportDTO): Promise<void> {
    const report = await this.reports.findComment(id);
    if (!report) throw new AppError('CONTENT_NOT_FOUND');
    const expected = report.value.status;
    if (input.decision === 'resolved') report.resolve(reviewerId, input.note);
    else report.dismiss(reviewerId, input.note);
    if (!(await this.reports.saveComment(report, expected))) throw new AppError('CONTENT_UPDATE_CONFLICT');
  }
}
