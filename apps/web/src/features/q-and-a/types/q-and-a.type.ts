import type { components, paths } from '@devhub-404/api-contract';

export type Answer = components['schemas']['AnswerDTO'];
export type CreateQuestionDTO = components['schemas']['CreateQuestionDTO'];
export type CreateAnswerDTO = components['schemas']['CreateAnswerDTO'];
export type ListQuestionsQuery = NonNullable<paths['/api/v1/questions']['get']['parameters']['query']>;
export type QAndAAccountContribution = components['schemas']['QAndAAccountContributionDTO'];
export type QuestionListItem = components['schemas']['QuestionItemDTO'];
export type Question = components['schemas']['QuestionDTO'];
