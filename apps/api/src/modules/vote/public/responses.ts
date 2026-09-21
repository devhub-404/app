import { HttpStatus } from '@nestjs/common';
import type { ResponseMetadata } from '@/shared/http/response-metadata';

export const VOTE_RESPONSES = {
  CONTENT_VOTE_SET: { status: HttpStatus.OK, message: 'Voto atualizado' },
  CONTENT_VOTES_LISTED: { status: HttpStatus.OK, message: 'Votos listados' },
  PERSONAL_VOTES_SYNCED: { status: HttpStatus.OK, message: 'Votos pessoais sincronizados' },
  CONTENT_VOTE_SUMMARY_FETCHED: { status: HttpStatus.OK, message: 'Resumo de votos encontrado' },
} as const satisfies ResponseMetadata;
