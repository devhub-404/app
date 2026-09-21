import type { Question } from '@/features/q-and-a/types/q-and-a.type.ts';
import type { Actor } from '../../auth/public/access.ts';

export function isQuestionAuthor(question: Pick<Question, 'authorAccountId'>, accountId: string | null | undefined) {
  return Boolean(accountId && question.authorAccountId === accountId);
}

export function isQuestionModerator(role: string | null | undefined): boolean {
  return role === 'moderator' || role === 'admin';
}

export function canModerateQuestion(actor: Actor): boolean {
  return isQuestionModerator(actor.role);
}

export function canCloseQuestion(actor: Actor): boolean {
  return canModerateQuestion(actor);
}

export function canReopenQuestion(actor: Actor): boolean {
  return canModerateQuestion(actor);
}

export function canHideQuestion(actor: Actor): boolean {
  return canModerateQuestion(actor);
}

export function canUnhideQuestion(actor: Actor): boolean {
  return canModerateQuestion(actor);
}

export function canAcceptQuestionAnswer(question: Pick<Question, 'authorAccountId'>, actor: Actor): boolean {
  return isQuestionAuthor(question, actor.accountId);
}

export function canDeleteQuestion(question: Pick<Question, 'authorAccountId'>, actor: Actor): boolean {
  return canAcceptQuestionAnswer(question, actor) || actor.role === 'admin';
}

export function isAnswerAuthor(
  question: { answers: readonly { id: string; authorAccountId: unknown | null }[] },
  answerId: string,
  accountId: string | null | undefined,
): boolean {
  return Boolean(accountId && question.answers.find((answer) => answer.id === answerId)?.authorAccountId === accountId);
}

export function canDeleteQuestionAnswer(
  question: { answers: readonly { id: string; authorAccountId: unknown | null }[] },
  answerId: string,
  actor: Actor,
): boolean {
  return isAnswerAuthor(question, answerId, actor.accountId) || actor.role === 'admin';
}

export function canSubmitQuestionAnswer(actor: Actor): boolean {
  return Boolean(actor.accountId);
}
