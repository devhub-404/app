export { default as QuestionsPage } from '../ui/pages/questions.page.astro';
export { default as NewQuestionPage } from '../ui/pages/new-question.page.astro';
export { default as QuestionPage } from '../ui/pages/question.page.astro';
export {
  getQuestionQuery,
  listQuestionsForManagement,
  listMyQAndAContributions,
  listMyAnswers,
} from '../actions/question.action.ts';
export type { QAndAAccountContribution, Question } from '@/features/q-and-a/types/q-and-a.type.ts';
export {
  canAcceptQuestionAnswer,
  canCloseQuestion,
  canDeleteQuestion,
  canDeleteQuestionAnswer,
  canModerateQuestion,
  canReopenQuestion,
  canSubmitQuestionAnswer,
  canHideQuestion,
  canUnhideQuestion,
  isAnswerAuthor,
  isQuestionAuthor,
  isQuestionModerator,
} from '../access/question.access.ts';
export {
  isQuestionAnswerable,
  isQuestionClosable,
  isQuestionHideable,
  isQuestionReopenable,
  isQuestionSolved,
  isQuestionUnhideable,
  type QuestionState,
} from '../domain/question.domain.ts';

export { listQuestionsQuery } from '../actions/question.action.ts';
export { default as QuestionsListing } from '../ui/components/questions-listing.component.tsx';
export type { QuestionsListingState } from '../ui/components/questions-listing.component.tsx';
