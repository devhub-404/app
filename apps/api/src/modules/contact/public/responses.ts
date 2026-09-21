import { HttpStatus } from '@nestjs/common';
import type { ResponseMetadata } from '@/shared/http/response-metadata';

export { CONTACT_RESPONSES } from '@/modules/contact/presentation/contact.responses';

export const CONTACT_COMMON_RESPONSES = {
  INVALID_URL: { status: HttpStatus.BAD_REQUEST, message: 'URL inválida' },
} as const satisfies ResponseMetadata;
