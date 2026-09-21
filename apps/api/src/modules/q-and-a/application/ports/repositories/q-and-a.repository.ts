import type { AnswerDTO, ListQuestionsDTO, PaginatedQuestionsDTO, QuestionDTO } from '../../dtos';
import type { Role } from '@/shared/kernel/auth/role';

export type QAndAViewer = { sub: string; role: Role | null };

export type QAndAContributionRow = {
  id: string;
  kind: 'question' | 'answer';
  questionId: string;
  title: string;
  createdAt: string;
  hiddenAt: string | null;
};

export abstract class QAndARepository {
  abstract transaction<T>(work: (context: unknown) => Promise<T>): Promise<T>;
  abstract createQuestion(
    this: void,
    id: string,
    authorAccountId: string,
    title: string,
    content: string,
    context?: unknown,
  ): Promise<QuestionDTO>;
  abstract list(input: ListQuestionsDTO): Promise<PaginatedQuestionsDTO>;
  abstract listPublicContributionsByAuthor(accountId: string, limit?: number): Promise<QAndAContributionRow[]>;
  abstract listContributionsByAuthor(accountId: string, limit?: number): Promise<QAndAContributionRow[]>;
  abstract getQuestion(this: void, id: string, viewer?: QAndAViewer): Promise<QuestionDTO | null>;
  abstract getAnswer(this: void, id: string, viewer?: QAndAViewer): Promise<AnswerDTO | null>;
  abstract createAnswer(
    this: void,
    id: string,
    questionId: string,
    authorAccountId: string,
    content: string,
    context?: unknown,
  ): Promise<AnswerDTO>;
  abstract acceptAnswer(id: string, authorAccountId: string, answerId: string): Promise<QuestionDTO | null>;
  abstract removeAcceptedAnswer(id: string, authorAccountId: string): Promise<QuestionDTO | null>;
  abstract closeQuestion(id: string): Promise<QuestionDTO | null>;
  abstract reopenQuestion(id: string): Promise<QuestionDTO | null>;
  abstract deleteQuestion(id: string, accountId: string, isAdministrator: boolean): Promise<boolean>;
  abstract deleteAnswer(
    questionId: string,
    answerId: string,
    accountId: string,
    isAdministrator: boolean,
  ): Promise<boolean>;
  abstract anonymizeAuthor(accountId: string): Promise<{ questions: number; answers: number }>;
  abstract moderateTarget(id: string, action: 'hide' | 'restore'): Promise<boolean>;
  abstract resolveTarget(id: string): Promise<{ type: 'question' | 'answer'; isPublic: boolean } | null>;
  abstract listHiddenForModeration(): Promise<Array<{ id: string; kind: 'question' | 'answer'; hiddenAt: string }>>;
}
