import type { components, paths } from '@devhub-404/api-contract';

export type Job = components['schemas']['JobDTO'];
export type JobType = Job['employmentType'];
export type SaveJob = components['schemas']['SaveJobDTO'];
export type UpdateJob = components['schemas']['UpdateJobDTO'];
export type SubmitCommunityJob = components['schemas']['SubmitCommunityJobDTO'];
export type ListJobsQuery = NonNullable<paths['/api/v1/jobs']['get']['parameters']['query']>;
