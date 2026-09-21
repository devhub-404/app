import type { AnswerDTO, PaginatedQuestionsDTO, QuestionDTO } from '../../dtos';
import type { QAndAContributionRow, QAndAViewer } from './q-and-a.repository';
import type { QAndASearchCriteria } from './q-and-a-search.criteria';

export abstract class QAndAQueryRepository {
  abstract search(criteria: QAndASearchCriteria): Promise<PaginatedQuestionsDTO>;
  abstract findQuestion(id: string, viewer?: QAndAViewer): Promise<QuestionDTO | null>;
  abstract findAnswer(id: string, viewer?: QAndAViewer): Promise<AnswerDTO | null>;
  abstract listPublicContributionsByAuthor(accountId: string, limit?: number): Promise<QAndAContributionRow[]>;
  abstract listContributionsByAuthor(accountId: string, limit?: number): Promise<QAndAContributionRow[]>;
  abstract resolveTarget(id: string): Promise<{ type: 'question' | 'answer'; isPublic: boolean } | null>;
  abstract listHiddenForModeration(): Promise<Array<{ id: string; kind: 'question' | 'answer'; hiddenAt: string }>>;
}
