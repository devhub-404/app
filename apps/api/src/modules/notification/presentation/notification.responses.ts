import { HttpStatus } from '@nestjs/common';
import type { ResponseMetadata } from '@/shared/http/response-metadata';

export const NOTIFICATION_RESPONSES = {
  NOTIFICATIONS_SYNCED: { status: HttpStatus.OK, message: 'Notifications sincronizadas' },
  NOTIFICATION_STATUS_FETCHED: { status: HttpStatus.OK, message: 'Status de Notifications consultado' },
  NOTIFICATION_MARKED_READ: { status: HttpStatus.OK, message: 'Notification marcada como lida' },
  NOTIFICATIONS_MARKED_READ: { status: HttpStatus.OK, message: 'Notifications marcadas como lidas' },
} as const satisfies ResponseMetadata;
