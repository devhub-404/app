import type { components, paths } from '@devhub-404/api-contract';

export type AuthorDTO = components['schemas']['AuthorDTO'];
export type ArticleTag = components['schemas']['ContentTagDTO'];
export type ArticleItemDTO = components['schemas']['ArticleItemDTO'];
export type ArticleDTO = components['schemas']['ArticleDTO'];
export type ArticleContentDTO = components['schemas']['ArticleContentDTO'];
export type SaveArticleDraftInputDTO = components['schemas']['SaveArticleDraftInputDTO'];
export type UpdateArticleDTO = components['schemas']['UpdateArticleDTO'];

type ArticleListResponseDTO = paths['/api/v1/articles']['get']['responses'][200]['content']['application/json'];

export type ArticleListDataDTO = NonNullable<ArticleListResponseDTO['data']>;
export type ArticlePopularTagDTO = components['schemas']['ArticlePopularTagDTO'];
export type SaveArticleDraftOutputDTO = components['schemas']['SaveArticleDraftOutputDTO'];
export type ArticleAuthor = NonNullable<ArticleItemDTO['author']>;
export type ArticleItem = ArticleItemDTO;
export type ArticleDetails = ArticleDTO & Pick<ArticleContentDTO, 'content' | 'contentVersion'>;
