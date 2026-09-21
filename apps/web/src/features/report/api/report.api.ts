import { privateClient } from '@/shared/api';
import type { ApiResult } from '@/shared/api';
import type { CreateReportInput, ReportStatus, ReviewReportInput } from '@/features/report/types/report.type.ts';

export class ReportApi {
  static reportResource(resourceId: string, body: CreateReportInput): Promise<ApiResult<unknown>> {
    return privateClient.POST('/api/v1/resources/{resourceId}/reports', {
      params: { path: { resourceId } },
      body,
    }) as Promise<ApiResult<unknown>>;
  }

  static reportComment(commentId: string, body: CreateReportInput): Promise<ApiResult<unknown>> {
    return privateClient.POST('/api/v1/comments/{commentId}/reports', {
      params: { path: { commentId } },
      body,
    }) as Promise<ApiResult<unknown>>;
  }

  static listResources(status?: ReportStatus): Promise<ApiResult<unknown>> {
    return privateClient.GET('/api/v1/reports/resources', {
      params: { query: { status } },
    }) as Promise<ApiResult<unknown>>;
  }

  static listComments(status?: ReportStatus): Promise<ApiResult<unknown>> {
    return privateClient.GET('/api/v1/reports/comments', {
      params: { query: { status } },
    }) as Promise<ApiResult<unknown>>;
  }

  static reviewResource(id: string, body: ReviewReportInput): Promise<ApiResult<unknown>> {
    return privateClient.PATCH('/api/v1/reports/resources/{id}', {
      params: { path: { id } },
      body,
    }) as Promise<ApiResult<unknown>>;
  }

  static reviewComment(id: string, body: ReviewReportInput): Promise<ApiResult<unknown>> {
    return privateClient.PATCH('/api/v1/reports/comments/{id}', {
      params: { path: { id } },
      body,
    }) as Promise<ApiResult<unknown>>;
  }
}
