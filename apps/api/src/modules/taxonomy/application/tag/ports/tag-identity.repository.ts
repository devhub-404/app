export type TagIdentityTermKind = 'reserved' | 'blocked';

export type TagAliasRecord = {
  id: string;
  tagId: string;
  alias: string;
  createdAt: string;
};

export type TagIdentityTermRecord = {
  id: string;
  value: string;
  kind: TagIdentityTermKind;
  createdAt: string;
  updatedAt: string;
};

export abstract class TagIdentityRepository {
  abstract findCanonicalTagIdByAlias(value: string): Promise<string | null>;
  abstract findAliasByValue(value: string): Promise<TagAliasRecord | null>;
  abstract listAliases(tagId?: string): Promise<TagAliasRecord[]>;
  abstract createAlias(tagId: string, alias: string): Promise<TagAliasRecord>;
  abstract deleteAlias(id: string): Promise<void>;

  abstract findIdentityTerm(value: string): Promise<TagIdentityTermRecord | null>;
  abstract listIdentityTerms(kind?: TagIdentityTermKind): Promise<TagIdentityTermRecord[]>;
  abstract setIdentityTerm(value: string, kind: TagIdentityTermKind): Promise<TagIdentityTermRecord>;
  abstract deleteIdentityTerm(id: string): Promise<void>;
}
