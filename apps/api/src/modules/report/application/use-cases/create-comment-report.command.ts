import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { CommentModerationPort } from '@/modules/comment/public';
import { CommentReport } from '@/modules/report/domain';
import { ReportRepository } from '../ports/report.repository';
import { CreateCommentReportInputDTO } from '../dtos/in';
import { ReportCreatedDTO } from '../dtos';

@Injectable()
export class CreateCommentReportCommand {
  constructor(
    private readonly comments: CommentModerationPort,
    private readonly reports: ReportRepository,
  ) {}

  async execute(input: CreateCommentReportInputDTO): Promise<ReportCreatedDTO> {
    if (!(await this.comments.resolve(input.commentId))) throw new AppError('CONTENT_COMMENT_NOT_FOUND');
    const report = CommentReport.create(randomUUID(), {
      commentId: input.commentId,
      reporterAccountId: input.accountId,
      reason: input.reason,
      description: input.description ?? null,
    });
    await this.reports.createComment(report);

    return { id: report.value.id };
  }
}
