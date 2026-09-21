import type { CreateTagProps, Tag, TagStatus } from '@/modules/taxonomy/domain/tag';

export abstract class TagRepository {
  abstract findById(id: string): Promise<Tag | null>;
  abstract create(props: CreateTagProps): Promise<void>;
  abstract save(tag: Tag): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract setStatus(id: string, status: TagStatus): Promise<void>;
}
