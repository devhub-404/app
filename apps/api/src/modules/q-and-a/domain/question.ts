import { DomainError } from '@/shared/errors/domain-error';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';
import type { Answer } from './answer';

export type QuestionStatus = 'open' | 'closed';

export type QuestionState = {
  id: string;
  authorAccountId: string | null;
  title: string;
  content: string;
  status: QuestionStatus;
  acceptedAnswerId: string | null;
  hiddenAt: string | null;
  deletedAt: string | null;
  createdAt: string;
};

export class Question {
  private constructor(private readonly state: QuestionState) {}

  static create(
    input: { id: string; authorAccountId: string; title: string; content: string },
    at = new Date(),
  ): Question {
    const now = at.toISOString();
    const question = new Question({
      ...input,
      status: 'open',
      acceptedAnswerId: null,
      hiddenAt: null,
      deletedAt: null,
      createdAt: now,
    });
    question.validate();

    return question;
  }

  static rehydrate(state: QuestionState): Question {
    return new Question({ ...state });
  }
  get value(): QuestionState {
    return { ...this.state };
  }

  addAnswer(answer: Answer): void {
    this.ensureUsable();
    if (this.state.status === 'closed') throw new DomainError('QUESTION_CLOSED');
    if (answer.value.questionId !== this.state.id) throw new DomainError('ANSWER_WRONG_QUESTION');
  }

  acceptAnswer(answer: Answer, at = new Date()): void {
    this.ensureUsable();
    if (answer.value.questionId !== this.state.id) throw new DomainError('ANSWER_WRONG_QUESTION');
    if (answer.value.deletedAt || answer.value.hiddenAt) throw new DomainError('ANSWER_NOT_ELIGIBLE');
    if (this.state.acceptedAnswerId && this.state.acceptedAnswerId !== answer.value.id)
      throw new DomainError('QUESTION_ALREADY_SOLVED');
    this.state.acceptedAnswerId = answer.value.id;
    answer.accept(at);
  }

  replaceAcceptedAnswer(previous: Answer, answer: Answer, at = new Date()): void {
    this.ensureUsable();
    if (this.state.acceptedAnswerId !== previous.value.id) throw new DomainError('QUESTION_ALREADY_SOLVED');
    if (previous.value.questionId !== this.state.id || answer.value.questionId !== this.state.id)
      throw new DomainError('ANSWER_WRONG_QUESTION');
    if (answer.value.deletedAt || answer.value.hiddenAt) throw new DomainError('ANSWER_NOT_ELIGIBLE');

    previous.unaccept();
    answer.accept(at);
    this.state.acceptedAnswerId = answer.value.id;
  }

  removeAcceptedAnswer(answer: Answer): void {
    if (answer.value.questionId !== this.state.id) throw new DomainError('ANSWER_WRONG_QUESTION');
    if (this.state.acceptedAnswerId === answer.value.id) {
      this.state.acceptedAnswerId = null;
      answer.unaccept();
    }
  }

  hideAnswer(answer: Answer, at = new Date()): void {
    this.ensureNotDeleted();
    if (answer.value.questionId !== this.state.id) throw new DomainError('ANSWER_WRONG_QUESTION');
    answer.hide(at);
    if (this.state.acceptedAnswerId === answer.value.id) this.state.acceptedAnswerId = null;
  }

  deleteAnswer(answer: Answer, at = new Date()): void {
    this.ensureNotDeleted();
    if (answer.value.questionId !== this.state.id) throw new DomainError('ANSWER_WRONG_QUESTION');
    answer.delete(at);
    if (this.state.acceptedAnswerId === answer.value.id) this.state.acceptedAnswerId = null;
  }

  close(): void {
    this.ensureUsable();
    if (this.state.status !== 'open') throw new DomainError('QUESTION_INVALID_STATUS');
    this.state.status = 'closed';
  }
  reopen(): void {
    this.ensureUsable();
    if (this.state.status !== 'closed') throw new DomainError('QUESTION_INVALID_STATUS');
    this.state.status = 'open';
  }
  hide(at = new Date()): void {
    this.ensureNotDeleted();
    this.state.hiddenAt = at.toISOString();
  }
  unhide(): void {
    this.ensureNotDeleted();
    this.state.hiddenAt = null;
  }
  delete(at = new Date()): void {
    this.ensureNotDeleted();
    this.state.deletedAt = at.toISOString();
    this.state.acceptedAnswerId = null;
  }

  private validate(): void {
    if (!this.state.authorAccountId) throw new DomainError('QUESTION_AUTHOR_REQUIRED');
    if (this.state.title.trim().length < 3 || this.state.title.length > FIELD_LIMITS.title)
      throw new DomainError('QUESTION_INVALID_TITLE');
    if (!this.state.content.trim() || this.state.content.length > FIELD_LIMITS.body)
      throw new DomainError('QUESTION_INVALID_CONTENT');
  }
  private ensureNotDeleted(): void {
    if (this.state.deletedAt) throw new DomainError('QUESTION_DELETED');
  }
  private ensureUsable(): void {
    this.ensureNotDeleted();
    if (this.state.hiddenAt) throw new DomainError('QUESTION_HIDDEN');
  }
}
