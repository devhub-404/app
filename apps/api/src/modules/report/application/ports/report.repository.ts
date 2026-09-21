import type { CommentReport, ResourceReport, ReportStatus } from '@/modules/report/domain';

export abstract class ReportRepository {
  abstract createResource(report: ResourceReport): Promise<void>;
  abstract createComment(report: CommentReport): Promise<void>;
  abstract findResource(id: string): Promise<ResourceReport | null>;
  abstract findComment(id: string): Promise<CommentReport | null>;
  abstract saveResource(report: ResourceReport, expectedStatus: ReportStatus): Promise<boolean>;
  abstract saveComment(report: CommentReport, expectedStatus: ReportStatus): Promise<boolean>;
  abstract listResources(status?: ReportStatus): Promise<ResourceReport[]>;
  abstract listComments(status?: ReportStatus): Promise<CommentReport[]>;
}
