import { HttpStatus } from '@nestjs/common';
import type { ResponseMetadata } from '@/shared/http/response-metadata';

export const COMMENT_RESPONSES = {
  CONTENT_COMMENTS_LISTED: { status: HttpStatus.OK, message: 'Comentários listados' },
  CONTENT_HIDDEN_COMMENTS_LISTED: { status: HttpStatus.OK, message: 'Comentários ocultos listados' },
  CONTENT_COMMENT_FETCHED: { status: HttpStatus.OK, message: 'Comentário encontrado' },
  CONTENT_MY_COMMENTS_LISTED: { status: HttpStatus.OK, message: 'Meus comentários listados' },
  CONTENT_ADMIN_COMMENTS_LISTED: { status: HttpStatus.OK, message: 'Comentários administrativos listados' },
  CONTENT_COMMENT_CREATED: { status: HttpStatus.CREATED, message: 'Comentário criado' },
  CONTENT_COMMENT_UPDATED: { status: HttpStatus.OK, message: 'Comentário atualizado' },
  CONTENT_COMMENT_HIDDEN: { status: HttpStatus.OK, message: 'Comentário ocultado' },
  CONTENT_COMMENT_UNHIDDEN: { status: HttpStatus.OK, message: 'Comentário reexibido' },
  CONTENT_COMMENT_DELETED: { status: HttpStatus.OK, message: 'Comentário removido' },
  CONTENT_COMMENT_NOT_FOUND: { status: HttpStatus.NOT_FOUND, message: 'Comentário não encontrado' },
  CONTENT_COMMENT_INVALID_PARENT: { status: HttpStatus.BAD_REQUEST, message: 'Comentário pai inválido' },
  CONTENT_COMMENT_INVALID_CONTENT: { status: HttpStatus.BAD_REQUEST, message: 'Comentário inválido' },
  CONTENT_COMMENT_INVALID_UPDATED_AT: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Data de atualização do comentário inválida',
  },
} as const satisfies ResponseMetadata;
