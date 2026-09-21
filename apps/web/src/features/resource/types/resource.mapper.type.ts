import type { ResourceItem, ResourceItemDTO } from '@/features/resource/types/resource.type.ts';
export function toResourceItem(dto: ResourceItemDTO): ResourceItem {
  return { ...dto, tags: dto.tags ?? [], votes: Number(dto.votes ?? 0) };
}
