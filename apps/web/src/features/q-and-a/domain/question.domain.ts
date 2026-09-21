import type { Question } from '@/features/q-and-a/types/q-and-a.type.ts';

export type QuestionState = 'open' | 'closed';

export function isQuestionAnswerable(question: Pick<Question, 'status'> | QuestionState): boolean {
  return typeof question === 'string' ? question === 'open' : question.status === 'open';
}

export function isQuestionClosable(question: Pick<Question, 'status'>): boolean {
  return question.status === 'open';
}

export function isQuestionReopenable(question: Pick<Question, 'status'>): boolean {
  return question.status === 'closed';
}

export function isQuestionHideable(question: Pick<Question, 'hiddenAt'>): boolean {
  return !question.hiddenAt;
}

export function isQuestionUnhideable(question: Pick<Question, 'hiddenAt'>): boolean {
  return Boolean(question.hiddenAt);
}

export function isQuestionSolved(acceptedAnswerId: unknown): boolean {
  return Boolean(acceptedAnswerId);
}
