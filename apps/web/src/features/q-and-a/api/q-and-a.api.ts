import { privateClient } from '@/shared/api';
import { publicClient } from '@/shared/api';
import type { ApiClient, ApiResult, Paginated } from '@/shared/api';
import type {
  Answer,
  CreateQuestionDTO,
  ListQuestionsQuery,
  QAndAAccountContribution,
  Question,
  QuestionListItem,
} from '@/features/q-and-a/types/q-and-a.type.ts';
const pub = publicClient;
const priv = privateClient;
export class QAndAApi {
  static listMyAnswers(limit = 20): Promise<ApiResult<Answer[]>> {
    return priv.GET('/api/v1/answers/mine', { params: { query: { limit: String(limit) } } });
  }
  static listForManagement(query?: ListQuestionsQuery): Promise<ApiResult<Paginated<QuestionListItem>>> {
    return priv.GET('/api/v1/questions/administration', { params: { query } });
  }
  static list(query?: ListQuestionsQuery, client: ApiClient = pub): Promise<ApiResult<Paginated<QuestionListItem>>> {
    return client.GET('/api/v1/questions', { params: { query } });
  }
  static listMine(limit = 20): Promise<ApiResult<QAndAAccountContribution[]>> {
    return priv.GET('/api/v1/questions/mine', {
      params: { query: { limit: String(limit) } },
    });
  }
  static get(id: string, client: ApiClient = pub): Promise<ApiResult<Question>> {
    return client.GET('/api/v1/questions/{id}', { params: { path: { id } } });
  }
  static create(body: CreateQuestionDTO): Promise<ApiResult<Question>> {
    return priv.POST('/api/v1/questions', { body });
  }
  static answer(id: string, content: string): Promise<ApiResult<Answer>> {
    return priv.POST('/api/v1/questions/{id}/answers', {
      params: { path: { id } },
      body: { content },
    });
  }
  static accept(id: string, answerId: string): Promise<ApiResult<Question>> {
    return priv.PUT('/api/v1/questions/{id}/accepted-answer/{answerId}', {
      params: { path: { id, answerId } },
    });
  }
  static removeAccepted(id: string): Promise<ApiResult<Question>> {
    return priv.DELETE('/api/v1/questions/{id}/accepted-answer', {
      params: { path: { id } },
    });
  }
  static deleteQuestion(id: string) {
    return priv.DELETE('/api/v1/questions/{id}', { params: { path: { id } } });
  }
  static deleteAnswer(id: string, answerId: string) {
    return priv.DELETE('/api/v1/questions/{id}/answers/{answerId}', {
      params: { path: { id, answerId } },
    });
  }
  static close(id: string) {
    return priv.POST('/api/v1/questions/{id}/close', {
      params: { path: { id } },
    });
  }
  static reopen(id: string) {
    return priv.POST('/api/v1/questions/{id}/reopen', {
      params: { path: { id } },
    });
  }
  static hide(id: string) {
    return priv.POST('/api/v1/moderation/resources/{resourceId}/hide', { params: { path: { resourceId: id } } });
  }
  static unhide(id: string) {
    return priv.POST('/api/v1/moderation/resources/{resourceId}/unhide', { params: { path: { resourceId: id } } });
  }
}
