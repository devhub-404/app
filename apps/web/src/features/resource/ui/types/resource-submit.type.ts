import type { CreateResourceDTO } from '@/features/resource/types/resource.type.ts';

export type ResourceSubmitData = Omit<CreateResourceDTO, 'tagSlugs'> & {
  tags: CreateResourceDTO['tagSlugs'];
};
