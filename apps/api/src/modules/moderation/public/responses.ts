import { HttpStatus } from '@nestjs/common';
import type { ResponseMetadata } from '@/shared/http/response-metadata';

export const MODERATION_RESPONSES = {
  ACCOUNT_STANDING_RETRIEVED: { status: HttpStatus.OK, message: 'Situação da conta obtida' },
  ACCOUNT_CAPABILITY_RESTRICTED: { status: HttpStatus.CREATED, message: 'Capacidade da conta restringida' },
  ACCOUNT_CAPABILITY_DENIED: { status: HttpStatus.FORBIDDEN, message: 'Capacidade da conta restringida' },
  ACCOUNT_RESTRICTION_REVOKED: { status: HttpStatus.OK, message: 'Restrição da conta revogada' },
} as const satisfies ResponseMetadata;
