import { HttpStatus } from '@nestjs/common';
import type { ResponseMetadata } from '@/shared/http/response-metadata';

export const VIEW_RESPONSES = {
  CONTENT_VIEW_RECORDED: { status: HttpStatus.OK, message: 'Visualização registrada' },
} as const satisfies ResponseMetadata;
