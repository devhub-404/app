import { externalResourcesSchema } from '@/shared/infrastructure/database/drizzle/schema/external-resource/external-resources.schema';
import { ExternalResource, type ExternalResourceStatus } from '@/modules/external-resource/domain/external-resource';

type ExternalResourceRow = typeof externalResourcesSchema.$inferSelect;
type ExternalResourceInsert = typeof externalResourcesSchema.$inferInsert;

export const ExternalResourcesMapper = {
  toEntity(
    row: ExternalResourceRow,
    createdAt: string,
    updatedAt: string,
    deletedAt: string | null,
    tagSlugs: string[],
  ): ExternalResource {
    return ExternalResource.rehydrate({
      id: row.id,
      title: row.title,
      description: row.description,
      url: row.url,
      status: row.status as ExternalResourceStatus,
      createdAt,
      updatedAt,
      deletedAt,
      tagSlugs,
    });
  },

  toPersistence(resource: ExternalResource): ExternalResourceInsert {
    return {
      id: resource.id,
      title: resource.title,
      description: resource.description,
      url: resource.url,
      status: resource.status,
    };
  },
};
