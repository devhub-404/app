import { HttpStatus } from '@nestjs/common';

export const PLATFORM_RESPONSES = {
  PLATFORM_HEALTH_RETRIEVED: { status: HttpStatus.OK, message: 'Saúde da plataforma recuperada' },
  PLATFORM_READINESS_RETRIEVED: { status: HttpStatus.OK, message: 'Prontidão da plataforma recuperada' },
} as const;
