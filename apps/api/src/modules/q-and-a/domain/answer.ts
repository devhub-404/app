import { DomainError } from '@/shared/errors/domain-error';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export type AnswerState = {
  id: string;
  questionId: string;
  authorAccountId: string | null;
  content: string;
  acceptedAt: string | null;
  hiddenAt: string | null;
  deletedAt: string | null;
  createdAt: string;
};

export class Answer {
  private constructor(private readonly state: AnswerState) {}

  static create(
    input: { id: string; questionId: string; authorAccountId: string; content: string },
    at = new Date(),
  ): Answer {
    const answer = new Answer({
      ...input,
      acceptedAt: null,
      hiddenAt: null,
      deletedAt: null,
      createdAt: at.toISOString(),
    });
    answer.validate();

    return answer;
  }

  static rehydrate(state: AnswerState): Answer {
    return new Answer({ ...state });
  }
  get value(): AnswerState {
    return { ...this.state };
  }
  accept(at = new Date()): void {
    if (this.state.deletedAt || this.state.hiddenAt) throw new DomainError('ANSWER_NOT_ELIGIBLE');
    this.state.acceptedAt = at.toISOString();
  }
  unaccept(): void {
    this.state.acceptedAt = null;
  }
  hide(at = new Date()): void {
    if (this.state.deletedAt) throw new DomainError('ANSWER_DELETED');
    this.state.hiddenAt = at.toISOString();
    this.state.acceptedAt = null;
  }
  unhide(): void {
    if (this.state.deletedAt) throw new DomainError('ANSWER_DELETED');
    this.state.hiddenAt = null;
  }
  delete(at = new Date()): void {
    if (this.state.deletedAt) throw new DomainError('ANSWER_DELETED');
    this.state.deletedAt = at.toISOString();
    this.state.acceptedAt = null;
  }
  private validate(): void {
    if (!this.state.authorAccountId) throw new DomainError('ANSWER_AUTHOR_REQUIRED');
    if (!this.state.content.trim() || this.state.content.length > FIELD_LIMITS.body)
      throw new DomainError('ANSWER_INVALID_CONTENT');
  }
}
