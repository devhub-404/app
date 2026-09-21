import { HttpStatus } from '@nestjs/common';
import type { ResponseMetadata } from '@/shared/http/response-metadata';

export const FEEDBACK_RESPONSES = {
  FEEDBACK_SUBMITTED: { status: HttpStatus.CREATED, message: 'Feedback recebido' },
  FEEDBACK_ADMINISTRATION_LISTED: { status: HttpStatus.OK, message: 'Feedbacks para triagem listados' },
  FEEDBACK_STATUS_UPDATED: { status: HttpStatus.OK, message: 'Status do feedback atualizado' },
  FEEDBACK_INVALID_STATUS: { status: HttpStatus.CONFLICT, message: 'Transição de status do feedback inválida' },
  FEEDBACK_INVALID_MEDIA: { status: HttpStatus.BAD_REQUEST, message: 'Imagem de feedback inválida ou não confirmada' },
} as const satisfies ResponseMetadata;
