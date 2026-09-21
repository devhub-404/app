import type { components } from '@devhub-404/api-contract';

export type CommentDTO = components['schemas']['CommentDTO'];
export type CommentCreatedDTO = components['schemas']['CommentCreatedDTO'];
export type CreateCommentDTO = components['schemas']['CreateCommentDTO'];
export type UpdateCommentDTO = components['schemas']['UpdateCommentDTO'];
export type ListCommentsQuery = { hidden?: boolean; page?: number; pageSize?: number };
export type PaginatedComments = { items: CommentDTO[]; total?: number; page?: number; pageSize?: number };
