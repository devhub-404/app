import type { JOB_TYPES, WORKPLACE_TYPES } from '../../dtos/dto.constants';

export type JobSearchCriteria = {
  search?: string;
  publisherOrganizationId?: string;
  employmentType?: (typeof JOB_TYPES)[number];
  workplaceType?: (typeof WORKPLACE_TYPES)[number];
  location?: string;
  minComp?: number;
  tags?: string[];
  sort?: 'recent' | 'comp';
  page?: number;
  pageSize?: number;
};
