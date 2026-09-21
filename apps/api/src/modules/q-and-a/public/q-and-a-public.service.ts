import { Injectable } from '@nestjs/common';
import { QAndARepository } from '../application/ports/repositories';
import { QAndAQueryRepository } from '../application/ports/repositories';
export type QAndAAccessSnapshot = { isPublic: boolean; ownerAccountId: string | null };

export type QAndAPublicContribution = {
  id: string;
  type: 'question' | 'answer';
  title: string;
  parentId: string | null;
  occurredAt: string;
};
export type QAndAAccountContribution = QAndAPublicContribution & { hiddenAt: string | null };

export abstract class QAndAPublicServicePort {
  abstract resolveAccess(id: string): Promise<QAndAAccessSnapshot | null>;
  abstract applyModerationAction(
    id: string,
    action: 'hide_question' | 'unhide_question' | 'hide_answer' | 'unhide_answer',
  ): Promise<void>;
  abstract listPublicByAuthor(accountId: string, limit?: number): Promise<QAndAPublicContribution[]>;
  abstract listByAuthor(accountId: string, limit?: number): Promise<QAndAAccountContribution[]>;
  abstract listHiddenForModeration(): Promise<Array<{ id: string; kind: 'question' | 'answer'; hiddenAt: string }>>;
}

@Injectable()
export class QAndAPublicService implements QAndAPublicServicePort {
  constructor(
    private readonly repository: QAndARepository,
    private readonly query: QAndAQueryRepository,
  ) {}

  listHiddenForModeration(): Promise<Array<{ id: string; kind: 'question' | 'answer'; hiddenAt: string }>> {
    return this.query.listHiddenForModeration();
  }

  async listPublicByAuthor(accountId: string, limit = 20): Promise<QAndAPublicContribution[]> {
    const rows = await this.query.listPublicContributionsByAuthor(accountId, limit);

    return rows.map((row) => ({
      id: row.id,
      type: row.kind,
      title: row.title,
      parentId: row.kind === 'answer' ? row.questionId : null,
      occurredAt: row.createdAt,
    }));
  }

  async listByAuthor(accountId: string, limit = 20): Promise<QAndAAccountContribution[]> {
    const rows = await this.query.listContributionsByAuthor(accountId, limit);

    return rows.map((row) => ({
      id: row.id,
      type: row.kind,
      title: row.title,
      parentId: row.kind === 'answer' ? row.questionId : null,
      occurredAt: row.createdAt,
      hiddenAt: row.hiddenAt,
    }));
  }

  async applyModerationAction(
    id: string,
    action: 'hide_question' | 'unhide_question' | 'hide_answer' | 'unhide_answer',
  ): Promise<void> {
    const target = await this.query.resolveTarget(id);
    if (
      !target ||
      (target.type === 'question' && !['hide_question', 'unhide_question'].includes(action)) ||
      (target.type === 'answer' && !['hide_answer', 'unhide_answer'].includes(action))
    )
      throw new Error('MODERATION_ACTION_NOT_SUPPORTED');
    const moderationAction = action.startsWith('unhide') ? 'restore' : 'hide';
    if (!(await this.repository.moderateTarget(id, moderationAction)))
      throw new Error('MODERATION_ACTION_NOT_SUPPORTED');
  }

  async resolveAccess(id: string): Promise<QAndAAccessSnapshot | null> {
    const target = await this.repository.resolveTarget(id);
    if (!target) return null;
    if (target.type === 'question') {
      const question = await this.query.findQuestion(id);
      if (!question) return null;

      return { isPublic: true, ownerAccountId: question.authorAccountId };
    }
    const answer = await this.query.findAnswer(id);
    if (!answer) return null;

    return { isPublic: true, ownerAccountId: answer.authorAccountId };
  }
}
