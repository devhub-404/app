export const DISCOVERY_TYPES = ['article', 'news', 'resource', 'question', 'project', 'job', 'event'] as const;
export type DiscoveryType = (typeof DISCOVERY_TYPES)[number];
