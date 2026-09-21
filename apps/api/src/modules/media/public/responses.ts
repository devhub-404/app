import { HttpStatus } from '@nestjs/common';
import type { ResponseMetadata } from '@/shared/http/response-metadata';

export const UPLOAD_RESPONSES = {
  UPLOAD_INVALID_CONTENT_TYPE: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Content-Type inválido para upload de imagem',
  },
  UPLOAD_INVALID_SIZE: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Tamanho inválido para upload de imagem',
  },
  UPLOAD_INVALID_EXPIRATION: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Expiração inválida para upload de imagem',
  },
  UPLOAD_INVALID_PURPOSE: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Purpose inválido para upload de imagem',
  },
  UPLOAD_ASSET_NOT_AVAILABLE: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Asset de imagem inexistente, expirado ou ainda não confirmado',
  },
  UPLOAD_URL_GENERATED: {
    status: HttpStatus.OK,
    message: 'URL de upload gerada',
  },
  UPLOAD_CONFIRMED: {
    status: HttpStatus.OK,
    message: 'Upload confirmado',
  },
  UPLOAD_DELETED: {
    status: HttpStatus.OK,
    message: 'Upload removido',
  },
} as const satisfies ResponseMetadata;
