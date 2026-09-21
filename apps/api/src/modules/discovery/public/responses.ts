import { HttpStatus } from '@nestjs/common';
import type { ResponseMetadata } from '@/shared/http/response-metadata';

export const DISCOVERY_RESPONSES = {
  DISCOVERY_LISTED: { status: HttpStatus.OK, message: 'Conteúdos de descoberta listados' },
} as const satisfies ResponseMetadata;
