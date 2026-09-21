import { HttpStatus } from '@nestjs/common';
import type { ResponseMetadata } from '@/shared/http/response-metadata';

export { AUTH_RESPONSES, SESSION_RESPONSES, USER_RESPONSES } from '@/modules/account/presentation/responses';

export const ACCOUNT_COMMON_RESPONSES = {
  INVALID_EMAIL: { status: HttpStatus.BAD_REQUEST, message: 'Email inválido' },
  DISPOSABLE_EMAIL_NOT_ALLOWED: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Use um email não descartável',
  },
  INVALID_PROVIDER_USER_ID: { status: HttpStatus.BAD_REQUEST, message: 'Provider user id inválido' },
  INVALID_PASSWORD_HASH: { status: HttpStatus.BAD_REQUEST, message: 'Password hash inválido' },
  INVALID_FAILED_ATTEMPTS: { status: HttpStatus.BAD_REQUEST, message: 'Quantidade de tentativas inválida' },
  SESSION_ALREADY_REVOKED: { status: HttpStatus.BAD_REQUEST, message: 'Sessão já revogada' },
  SESSION_CANNOT_UNREVOKE: { status: HttpStatus.BAD_REQUEST, message: 'Sessão não pode ser desrevogada' },
  SESSION_INVALID_REVOKED_AT: { status: HttpStatus.BAD_REQUEST, message: 'Revogação inválida' },
} as const satisfies ResponseMetadata;
