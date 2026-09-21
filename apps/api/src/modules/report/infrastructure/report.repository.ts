import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import {
  commentReportsSchema,
  resourceReportsSchema,
} from '@/shared/infrastructure/database/drizzle/schema/report/reports.schema';
import { CommentReport, ResourceReport, type ReportStatus } from '@/modules/report/domain';
import { ReportRepository } from '@/modules/report/application/ports/report.repository';

@Injectable()
export class DrizzleReportRepository implements ReportRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async createResource(report: ResourceReport): Promise<void> {
    await this.db.insert(resourceReportsSchema).values(report.value);
  }
  async createComment(report: CommentReport): Promise<void> {
    await this.db.insert(commentReportsSchema).values(report.value);
  }
  async findResource(id: string): Promise<ResourceReport | null> {
    const [row] = await this.db.select().from(resourceReportsSchema).where(eq(resourceReportsSchema.id, id)).limit(1);

    return row ? ResourceReport.rehydrate(row) : null;
  }
  async findComment(id: string): Promise<CommentReport | null> {
    const [row] = await this.db.select().from(commentReportsSchema).where(eq(commentReportsSchema.id, id)).limit(1);

    return row ? CommentReport.rehydrate(row) : null;
  }
  async saveResource(report: ResourceReport, expectedStatus: ReportStatus): Promise<boolean> {
    const v = report.value;
    const rows = await this.db
      .update(resourceReportsSchema)
      .set({
        status: v.status,
        reviewedByAccountId: v.reviewedByAccountId,
        decisionNote: v.decisionNote,
        reviewedAt: v.reviewedAt,
      })
      .where(and(eq(resourceReportsSchema.id, v.id), eq(resourceReportsSchema.status, expectedStatus)))
      .returning({ id: resourceReportsSchema.id });

    return rows.length > 0;
  }
  async saveComment(report: CommentReport, expectedStatus: ReportStatus): Promise<boolean> {
    const v = report.value;
    const rows = await this.db
      .update(commentReportsSchema)
      .set({
        status: v.status,
        reviewedByAccountId: v.reviewedByAccountId,
        decisionNote: v.decisionNote,
        reviewedAt: v.reviewedAt,
      })
      .where(and(eq(commentReportsSchema.id, v.id), eq(commentReportsSchema.status, expectedStatus)))
      .returning({ id: commentReportsSchema.id });

    return rows.length > 0;
  }
  async listResources(status?: ReportStatus): Promise<ResourceReport[]> {
    const rows = await this.db
      .select()
      .from(resourceReportsSchema)
      .where(status ? eq(resourceReportsSchema.status, status) : undefined)
      .orderBy(desc(resourceReportsSchema.createdAt));

    return rows.map((row) => ResourceReport.rehydrate(row));
  }
  async listComments(status?: ReportStatus): Promise<CommentReport[]> {
    const rows = await this.db
      .select()
      .from(commentReportsSchema)
      .where(status ? eq(commentReportsSchema.status, status) : undefined)
      .orderBy(desc(commentReportsSchema.createdAt));

    return rows.map((row) => CommentReport.rehydrate(row));
  }
}
