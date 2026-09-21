import { HttpStatus } from '@nestjs/common';
import type { ResponseMetadata } from '@/shared/http/response-metadata';

export const ARTICLE_RESPONSES = {
  ARTICLE_FETCHED: { status: HttpStatus.OK, message: 'Artigo obtido' },
  ARTICLE_LISTED: { status: HttpStatus.OK, message: 'Artigos listados' },
  ARTICLE_DRAFT_SAVED: { status: HttpStatus.CREATED, message: 'Rascunho de artigo salvo' },
  ARTICLE_PUBLISHED: { status: HttpStatus.OK, message: 'Artigo publicado' },
  ARTICLE_ARCHIVED: { status: HttpStatus.OK, message: 'Artigo arquivado' },
  ARTICLE_UNARCHIVED: { status: HttpStatus.OK, message: 'Artigo desarquivado' },
  ARTICLE_UPDATED: { status: HttpStatus.OK, message: 'Artigo atualizado' },
  ARTICLE_CONTENT_PATCH_INVALID: { status: HttpStatus.BAD_REQUEST, message: 'Patch de conteúdo inválido' },
  ARTICLE_CONTENT_CONFLICT: { status: HttpStatus.CONFLICT, message: 'Conflito na edição do artigo' },
  ARTICLE_DELETED: { status: HttpStatus.OK, message: 'Artigo removido' },
  ARTICLE_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    message: 'Artigo não encontrado',
  },
  ARTICLE_ALREADY_EXISTS: {
    status: HttpStatus.CONFLICT,
    message: 'Artigo já existe',
  },
  ARTICLE_LIKED: { status: HttpStatus.OK, message: 'Artigo curtido' },
  ARTICLE_UNLIKED: { status: HttpStatus.OK, message: 'Curtida removida' },
  ARTICLE_IS_DELETED: {
    status: HttpStatus.NOT_FOUND,
    message: 'Artigo removido',
  },
  ARTICLE_INVALID_TITLE: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Título inválido',
  },
  ARTICLE_INVALID_SLUG: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Slug inválido',
  },
  ARTICLE_INVALID_COVER_IMAGE_URL: {
    status: HttpStatus.BAD_REQUEST,
    message: 'URL da imagem inválida',
  },
  ARTICLE_INVALID_SUMMARY: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Resumo inválido',
  },
  ARTICLE_INVALID_CONTENT: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Conteúdo inválido',
  },
  ARTICLE_INVALID_READING_TIME: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Tempo de leitura inválido',
  },
  ARTICLE_INVALID_STATUS: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Status inválido',
  },
  ARTICLE_INVALID_PUBLISHED_AT: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Data de publicação inválida',
  },
  ARTICLE_INVALID_UPDATED_AT: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Data de atualização inválida',
  },
} as const satisfies ResponseMetadata;
