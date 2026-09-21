import { HttpStatus } from '@nestjs/common';
import type { ResponseMetadata } from '@/shared/http/response-metadata';

export const BOOKMARK_RESPONSES = {
  BOOKMARK_SAVED: { status: HttpStatus.OK, message: 'Bookmark salvo' },
  BOOKMARK_REMOVED: { status: HttpStatus.OK, message: 'Bookmark removido' },
  BOOKMARKS_SYNCED: { status: HttpStatus.OK, message: 'Bookmarks sincronizados' },
  BOOKMARKS_LISTED: { status: HttpStatus.OK, message: 'Bookmarks listados' },
  BOOKMARK_TARGET_NOT_FOUND: { status: HttpStatus.NOT_FOUND, message: 'Alvo de Bookmark não encontrado' },
} as const satisfies ResponseMetadata;
