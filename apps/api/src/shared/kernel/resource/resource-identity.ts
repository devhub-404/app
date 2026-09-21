export const RESOURCE_KINDS = [
  'article',
  'news',
  'external_resource',
  'project',
  'event',
  'job',
  'question',
  'answer',
] as const;

export type ResourceKind = (typeof RESOURCE_KINDS)[number];

export type ResourceIdentity = Readonly<{
  id: string;
  kind: ResourceKind;
}>;

export function isResourceKind(value: string): value is ResourceKind {
  return (RESOURCE_KINDS as readonly string[]).includes(value);
}
