import { privateClient } from '@/shared/api';
import { publicClient } from '@/shared/api';
import type { ApiResult } from '@/shared/api';
import type {
  CommentCreatedDTO,
  CommentDTO,
  CreateCommentDTO,
  ListCommentsQuery,
  PaginatedComments,
  UpdateCommentDTO,
} from '@/features/comment/types/comment.type.ts';

export class CommentApi {
  static async list(targetType: 'article' | 'news', contentId: string): Promise<ApiResult<CommentDTO[]>> {
    return targetType === 'article'
      ? publicClient.GET('/api/v1/articles/{articleId}/comments', { params: { path: { articleId: contentId } } })
      : publicClient.GET('/api/v1/news/{newsId}/comments', { params: { path: { newsId: contentId } } });
  }

  static async listMine(query?: ListCommentsQuery): Promise<ApiResult<PaginatedComments>> {
    return privateClient.GET('/api/v1/comments/me', { params: { query } });
  }

  static async listForAdministration(query?: ListCommentsQuery): Promise<ApiResult<PaginatedComments>> {
    return privateClient.GET('/api/v1/comments/administration', { params: { query } });
  }

  static async create(
    targetType: 'article' | 'news',
    contentId: string,
    payload: CreateCommentDTO,
  ): Promise<ApiResult<CommentCreatedDTO>> {
    return targetType === 'article'
      ? privateClient.POST('/api/v1/articles/{articleId}/comments', {
          params: { path: { articleId: contentId } },
          body: payload,
        })
      : privateClient.POST('/api/v1/news/{newsId}/comments', {
          params: { path: { newsId: contentId } },
          body: payload,
        });
  }

  static async update(id: string, payload: UpdateCommentDTO): Promise<ApiResult<CommentDTO>> {
    return privateClient.PATCH('/api/v1/comments/{id}', { params: { path: { id } }, body: payload });
  }

  static async remove(id: string): Promise<ApiResult<unknown>> {
    return privateClient.DELETE('/api/v1/comments/{id}', { params: { path: { id } } });
  }

  static async hide(id: string): Promise<ApiResult<unknown>> {
    return privateClient.POST('/api/v1/moderation/comments/{commentId}/hide', {
      params: { path: { commentId: id } },
    });
  }

  static async unhide(id: string): Promise<ApiResult<unknown>> {
    return privateClient.POST('/api/v1/moderation/comments/{commentId}/unhide', {
      params: { path: { commentId: id } },
    });
  }
}
