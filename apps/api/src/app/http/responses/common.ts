import { HttpStatus } from '@nestjs/common';
import type { ResponseMetadata } from '@/shared/http/response-metadata';

export const COMMON_RESPONSES = {
  NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    message: 'Recurso não encontrado',
  },
  UNAUTHORIZED: {
    status: HttpStatus.UNAUTHORIZED,
    message: 'Não autenticado',
  },
  FORBIDDEN: {
    status: HttpStatus.FORBIDDEN,
    message: 'Sem permissão',
  },
  INVALID_INPUT: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Entrada inválida',
  },
  CONFLICT: {
    status: HttpStatus.CONFLICT,
    message: 'Conflito de estado',
  },
  INTERNAL_SERVER_ERROR: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Erro interno do servidor',
  },
} as const satisfies ResponseMetadata;
