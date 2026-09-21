import type { ViewRecord } from './view.types';

export abstract class ViewRepository {
  abstract record(accountId: string, resourceId: string): Promise<ViewRecord>;
  abstract count(resourceId: string): Promise<number>;
  abstract countMany(resourceIds: string[]): Promise<Record<string, number>>;
  abstract deleteByAccountId(accountId: string): Promise<number>;
  abstract deleteByResourceId(resourceId: string): Promise<number>;
}
