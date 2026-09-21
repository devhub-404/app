import { HttpStatus } from '@nestjs/common';
import type { ResponseMetadata } from '@/shared/http/response-metadata';

export const TAG_RESPONSES = {
  CONTENT_INVALID_TAG_COUNT: {
    status: HttpStatus.BAD_REQUEST,
    message: 'A classificação deve possuir entre uma e cinco tags',
  },
  TAG_INVALID_NAME: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Nome de tag inválido',
  },
  TAG_INVALID_SLUG: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Slug de tag inválido',
  },
  TAG_FETCHED: { status: HttpStatus.OK, message: 'Tag obtido' },
  TAG_LISTED: { status: HttpStatus.OK, message: 'Tags listadas' },
  TAGS_SEARCHED: { status: HttpStatus.OK, message: 'Tags listadas' },
  TAG_CREATED: { status: HttpStatus.CREATED, message: 'Tag criada' },
  TAG_UPDATED: { status: HttpStatus.OK, message: 'Tag atualizada' },
  TAG_ARCHIVED: { status: HttpStatus.OK, message: 'Tag arquivada' },
  TAG_UNARCHIVED: { status: HttpStatus.OK, message: 'Tag desarquivada' },
  TAG_DELETED: { status: HttpStatus.OK, message: 'Tag removida' },
  TAG_RESOLVED: { status: HttpStatus.OK, message: 'Tag resolvida' },
  TAG_MERGED: { status: HttpStatus.OK, message: 'Tags mescladas' },
  TAG_ALIAS_CREATED: { status: HttpStatus.CREATED, message: 'Alias de Tag criado' },
  TAG_ALIAS_DELETED: { status: HttpStatus.OK, message: 'Alias de Tag removido' },
  TAG_ALIASES_LISTED: { status: HttpStatus.OK, message: 'Aliases de Tags listados' },
  TAG_IDENTITY_TERM_SET: { status: HttpStatus.OK, message: 'Controle de identidade de Tag salvo' },
  TAG_IDENTITY_TERM_DELETED: { status: HttpStatus.OK, message: 'Controle de identidade de Tag removido' },
  TAG_IDENTITY_TERMS_LISTED: { status: HttpStatus.OK, message: 'Controles de identidade de Tags listados' },
  TAG_FOLLOWED: { status: HttpStatus.OK, message: 'Tag seguida' },
  TAG_UNFOLLOWED: { status: HttpStatus.OK, message: 'Tag deixada de seguir' },
  TAG_FOLLOWS_LISTED: { status: HttpStatus.OK, message: 'Tags seguidas listadas' },
  TAG_FOLLOWS_SYNCED: { status: HttpStatus.OK, message: 'Tags seguidas sincronizadas' },
  TAG_MERGE_INVALID_TARGET: { status: HttpStatus.BAD_REQUEST, message: 'Destino de merge inválido' },
  TAG_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    message: 'Tag não encontrada',
  },
  TAG_ALREADY_EXISTS: { status: HttpStatus.CONFLICT, message: 'Tag já existe' },
  TAG_INVALID_ALIAS: { status: HttpStatus.BAD_REQUEST, message: 'Alias de Tag inválido' },
  TAG_INVALID_IDENTITY_TERM: { status: HttpStatus.BAD_REQUEST, message: 'Termo de identidade de Tag inválido' },
  TAG_IDENTITY_ALREADY_EXISTS: { status: HttpStatus.CONFLICT, message: 'Identidade de Tag já existe' },
  TAG_IDENTITY_IN_USE: { status: HttpStatus.CONFLICT, message: 'Identidade de Tag já está em uso' },
  TAG_IDENTITY_RESERVED: { status: HttpStatus.BAD_REQUEST, message: 'Identidade de Tag reservada' },
  TAG_IDENTITY_BLOCKED: { status: HttpStatus.BAD_REQUEST, message: 'Identidade de Tag bloqueada' },
} as const satisfies ResponseMetadata;
