import { HttpStatus } from '@nestjs/common';
import type { ResponseMetadata } from '@/shared/http/response-metadata';

/** HTTP contract owned by the Content capability and aggregated by app. */
export const CONTENT_RESPONSES = {
  CONTENT_PATCH_INVALID: { status: HttpStatus.BAD_REQUEST, message: 'Patch de conteúdo inválido' },
  CONTENT_UPDATE_CONFLICT: { status: HttpStatus.CONFLICT, message: 'O conteúdo mudou desde o início da edição' },
  CONTENT_FETCHED: { status: HttpStatus.OK, message: 'Conteúdo obtido' },
  CONTENT_LISTED: { status: HttpStatus.OK, message: 'Conteúdos listados' },
  CONTENT_VOTE_SYNCED: { status: HttpStatus.OK, message: 'Votos sincronizados' },
  CONTENT_INTERACTION_NOT_ALLOWED: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Interação não disponível para este conteúdo',
  },
  CONTENT_CREATED: { status: HttpStatus.CREATED, message: 'Conteúdo criado' },
  CONTENT_UPDATED: { status: HttpStatus.OK, message: 'Conteúdo atualizado' },
  CONTENT_DELETED: { status: HttpStatus.OK, message: 'Conteúdo removido' },
  CONTENT_NOT_FOUND: { status: HttpStatus.NOT_FOUND, message: 'Conteúdo não encontrado' },
  CONTENT_ALREADY_EXISTS: { status: HttpStatus.CONFLICT, message: 'Conteúdo já existe' },
} as const satisfies ResponseMetadata;
