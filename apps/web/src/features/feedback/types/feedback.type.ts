import type { components } from '@devhub-404/api-contract';

export type SubmitFeedbackPayload = components['schemas']['SubmitFeedbackDTO'];
export type FeedbackCategory = SubmitFeedbackPayload['category'];
