export type ExternalResourceAccess = {
  id: string;
  isPublic: boolean;
  ownerAccountId: string | null;
  title: string;
  description: string;
  url: string;
  status: string;
  updatedAt: string;
};

export type ExternalResourcePublicContribution = {
  id: string;
  type: 'resource';
  title: string;
  occurredAt: string | null;
};

export abstract class ExternalResourcePublicServicePort {
  abstract resolveAccess(resourceId: string): Promise<ExternalResourceAccess | null>;
  abstract applyEditorialAction(resourceId: string, action: 'archive' | 'delete'): Promise<void>;
  abstract listPublishedBySubmitter(accountId: string, limit?: number): Promise<ExternalResourcePublicContribution[]>;
}

export const RESOURCE_PUBLIC_SERVICE = 'RESOURCE_PUBLIC_SERVICE';
