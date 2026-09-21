import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import {
  TagIdentityRepository,
  type TagAliasRecord,
  type TagIdentityTermKind,
  type TagIdentityTermRecord,
} from '@/modules/taxonomy/application/tag/ports/tag-identity.repository';
import {
  tagAliasesSchema,
  tagIdentityTermsSchema,
} from '@/shared/infrastructure/database/drizzle/schema/taxonomy/tag-identities.schema';

@Injectable()
export class DrizzleTagIdentityRepository implements TagIdentityRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async findCanonicalTagIdByAlias(value: string): Promise<string | null> {
    const [row] = await this.db
      .select({ tagId: tagAliasesSchema.tagId })
      .from(tagAliasesSchema)
      .where(eq(tagAliasesSchema.alias, value));

    return row?.tagId ?? null;
  }

  async findAliasByValue(value: string): Promise<TagAliasRecord | null> {
    const [row] = await this.db.select().from(tagAliasesSchema).where(eq(tagAliasesSchema.alias, value));

    return row ?? null;
  }

  async listAliases(tagId?: string): Promise<TagAliasRecord[]> {
    return tagId
      ? this.db.select().from(tagAliasesSchema).where(eq(tagAliasesSchema.tagId, tagId))
      : this.db.select().from(tagAliasesSchema);
  }

  async createAlias(tagId: string, alias: string): Promise<TagAliasRecord> {
    const [row] = await this.db.insert(tagAliasesSchema).values({ tagId, alias }).returning();
    if (!row) throw new Error('Alias de tag nao encontrado apos criacao.');

    return row;
  }

  async deleteAlias(id: string): Promise<void> {
    await this.db.delete(tagAliasesSchema).where(eq(tagAliasesSchema.id, id));
  }

  async findIdentityTerm(value: string): Promise<TagIdentityTermRecord | null> {
    const [row] = await this.db.select().from(tagIdentityTermsSchema).where(eq(tagIdentityTermsSchema.value, value));

    return row ?? null;
  }

  async listIdentityTerms(kind?: TagIdentityTermKind): Promise<TagIdentityTermRecord[]> {
    return kind
      ? this.db.select().from(tagIdentityTermsSchema).where(eq(tagIdentityTermsSchema.kind, kind))
      : this.db.select().from(tagIdentityTermsSchema);
  }

  async setIdentityTerm(value: string, kind: TagIdentityTermKind): Promise<TagIdentityTermRecord> {
    const [row] = await this.db
      .insert(tagIdentityTermsSchema)
      .values({ value, kind })
      .onConflictDoUpdate({
        target: tagIdentityTermsSchema.value,
        set: { value, kind, updatedAt: new Date().toISOString() },
      })
      .returning();
    if (!row) throw new Error('Controle de identidade de tag nao encontrado apos gravacao.');

    return row;
  }

  async deleteIdentityTerm(id: string): Promise<void> {
    await this.db.delete(tagIdentityTermsSchema).where(eq(tagIdentityTermsSchema.id, id));
  }
}
