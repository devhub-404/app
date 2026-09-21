import { HttpStatus } from '@nestjs/common';
import type { ResponseMetadata } from '@/shared/http/response-metadata';

export const NEWS_RESPONSES = {
  NEWS_RETRIEVED: { status: HttpStatus.OK, message: 'Notícia obtida' },
  NEWS_LISTED: { status: HttpStatus.OK, message: 'Notícias listadas' },
  MY_NEWS_LISTED: { status: HttpStatus.OK, message: 'Minhas notícias listadas' },
  NEWS_DRAFT_SAVED: { status: HttpStatus.CREATED, message: 'Rascunho de notícia salvo' },
  NEWS_PUBLISHED: { status: HttpStatus.OK, message: 'Notícia publicada' },
  NEWS_ARCHIVED: { status: HttpStatus.OK, message: 'Notícia arquivada' },
  NEWS_UNARCHIVED: { status: HttpStatus.OK, message: 'Notícia desarquivada' },
  NEWS_UPDATED: { status: HttpStatus.OK, message: 'Notícia atualizada' },
  NEWS_CONTENT_PATCH_INVALID: { status: HttpStatus.BAD_REQUEST, message: 'Patch de conteúdo inválido' },
  NEWS_CONTENT_CONFLICT: { status: HttpStatus.CONFLICT, message: 'Conflito na edição da notícia' },
  NEWS_DELETED: { status: HttpStatus.OK, message: 'Notícia removida' },
  NEWS_RESTORED: { status: HttpStatus.OK, message: 'Notícia restaurada' },
  NEWS_REPORT_CREATED: { status: HttpStatus.CREATED, message: 'Denúncia de notícia criada' },
  NEWS_REPORTS_LISTED: { status: HttpStatus.OK, message: 'Denúncias de notícia listadas' },
  MY_NEWS_REPORTS_LISTED: { status: HttpStatus.OK, message: 'Minhas denúncias de notícia listadas' },
  NEWS_REPORT_STATUS_UPDATED: { status: HttpStatus.OK, message: 'Denúncia de notícia atualizada' },
  NEWS_SOURCES_LISTED: { status: HttpStatus.OK, message: 'Fontes de notícia listadas' },
  NEWS_SUGGESTION_SUBMITTED: { status: HttpStatus.CREATED, message: 'Sugestão de notícia enviada' },
  NEWS_SUGGESTIONS_LISTED: { status: HttpStatus.OK, message: 'Sugestões de notícia listadas' },
  NEWS_SUGGESTION_ACCEPTED: { status: HttpStatus.OK, message: 'Sugestão de notícia aceita' },
  NEWS_SUGGESTION_REJECTED: { status: HttpStatus.OK, message: 'Sugestão de notícia rejeitada' },
  NEWS_REPORT_DELETED: { status: HttpStatus.OK, message: 'Denúncia de notícia removida' },
  NEWS_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    message: 'Notícia não encontrada',
  },
  NEWS_ALREADY_EXISTS: {
    status: HttpStatus.CONFLICT,
    message: 'Notícia já existe',
  },
  NEWS_IS_DELETED: {
    status: HttpStatus.NOT_FOUND,
    message: 'Notícia removida',
  },
  NEWS_INVALID_TITLE: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Título inválido',
  },
  NEWS_INVALID_SLUG: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Slug inválido',
  },
  NEWS_INVALID_COVER_IMAGE_URL: {
    status: HttpStatus.BAD_REQUEST,
    message: 'URL da imagem inválida',
  },
  NEWS_INVALID_SUMMARY: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Resumo inválido',
  },
  NEWS_INVALID_CONTENT: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Conteúdo inválido',
  },
  NEWS_INVALID_PUBLISHED_AT: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Data de publicação inválida',
  },
  NEWS_INVALID_UPDATED_AT: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Data de atualização inválida',
  },
  NEWS_INVALID_STATUS: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Status inválido',
  },
} as const satisfies ResponseMetadata;
