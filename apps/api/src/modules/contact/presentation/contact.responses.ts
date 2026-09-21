import { HttpStatus } from '@nestjs/common';
import type { ResponseMetadata } from '@/shared/http/response-metadata';

export const CONTACT_RESPONSES = {
  CONTACT_MESSAGE_SUBMITTED: { status: HttpStatus.CREATED, message: 'Mensagem recebida' },
} as const satisfies ResponseMetadata;
