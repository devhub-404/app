import { HttpStatus } from '@nestjs/common';
import type { ResponseMetadata } from '@/shared/http/response-metadata';

export const RESOURCE_RESPONSES = {
  RESOURCE_INVALID_TITLE: { status: HttpStatus.BAD_REQUEST, message: 'Título inválido' },
  RESOURCE_INVALID_DESCRIPTION: { status: HttpStatus.BAD_REQUEST, message: 'Descrição inválida' },
  RESOURCE_INVALID_URL: { status: HttpStatus.BAD_REQUEST, message: 'URL inválida' },
  RESOURCE_INVALID_SOURCE: { status: HttpStatus.BAD_REQUEST, message: 'Fonte inválida' },
  RESOURCE_INVALID_PUBLISHED_AT: { status: HttpStatus.BAD_REQUEST, message: 'Data de publicação inválida' },
  RESOURCE_INVALID_STATUS: { status: HttpStatus.BAD_REQUEST, message: 'Status inválido' },
  RESOURCE_INVALID_AUTHOR: { status: HttpStatus.BAD_REQUEST, message: 'Autor inválido' },
  RESOURCE_INVALID_CONTENT: { status: HttpStatus.BAD_REQUEST, message: 'Conteúdo inválido' },
  RESOURCE_FETCHED: { status: HttpStatus.OK, message: 'Resource obtido' },
  RESOURCE_RETRIEVED: { status: HttpStatus.OK, message: 'Resource obtido' },
  RESOURCE_LISTED: { status: HttpStatus.OK, message: 'Resources listados' },
  RESOURCES_LISTED: { status: HttpStatus.OK, message: 'Resources listados' },
  PENDING_EXTERNAL_RESOURCE_SUGGESTIONS_LISTED: {
    status: HttpStatus.OK,
    message: 'Sugestões de Resources pendentes listadas',
  },
  EXTERNAL_RESOURCE_SUGGESTIONS_LISTED: {
    status: HttpStatus.OK,
    message: 'Sugestões de Resources listadas',
  },
  RESOURCE_CREATED: { status: HttpStatus.CREATED, message: 'Resource criado' },
  EXTERNAL_RESOURCE_SUGGESTION_CREATED: { status: HttpStatus.CREATED, message: 'Sugestão de Resource criada' },
  EXTERNAL_RESOURCE_SUGGESTION_APPROVED: { status: HttpStatus.OK, message: 'Sugestão de Resource aprovada' },
  EXTERNAL_RESOURCE_SUGGESTION_REJECTED: { status: HttpStatus.OK, message: 'Sugestão de Resource rejeitada' },
  RESOURCE_UPDATED: { status: HttpStatus.OK, message: 'Resource atualizado' },
  RESOURCE_ARCHIVED: { status: HttpStatus.OK, message: 'Resource arquivado' },
  RESOURCE_UNARCHIVED: { status: HttpStatus.OK, message: 'Resource desarquivado' },
  RESOURCE_DELETED: { status: HttpStatus.OK, message: 'Resource removido' },
  RESOURCE_RESTORED: { status: HttpStatus.OK, message: 'Resource restaurado' },
  RESOURCE_NOT_FOUND: { status: HttpStatus.NOT_FOUND, message: 'Resource não encontrado' },
  RESOURCE_ALREADY_EXISTS: { status: HttpStatus.CONFLICT, message: 'Resource já existe' },
  RESOURCE_IS_DELETED: { status: HttpStatus.CONFLICT, message: 'Resource removido' },
} as const satisfies ResponseMetadata;
