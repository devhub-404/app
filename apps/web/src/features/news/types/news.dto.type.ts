import type { components, paths } from '@devhub-404/api-contract';

export type NewsDTO = components['schemas']['NewsDTO'];
export type NewsDetails = components['schemas']['NewsDTO'];
export type NewsItemDTO = components['schemas']['NewsItemDTO'];
export type NewsItem = components['schemas']['NewsItemDTO'];
export type NewsSourceDTO = components['schemas']['NewsSourceDTO'];
export type NewsSuggestionDTO = components['schemas']['NewsSuggestionDTO'];
export type NewsTag = components['schemas']['NewsItemDTO']['tags'][number];
export type SaveNewsDraftInputDTO = components['schemas']['SaveNewsDraftInputDTO'];
export type SaveNewsDraftOutputDTO = components['schemas']['SaveNewsDraftOutputDTO'];
export type UpdateNewsDTO = components['schemas']['UpdateNewsDTO'];
export type ListNewsQuery = NonNullable<paths['/api/v1/news']['get']['parameters']['query']>;
