import { describe, expect, it, vi } from 'vitest';
import { RecordViewCommand } from '@/modules/view/application/use-cases/command/record-view.command';
import { AppError } from '@/shared/errors/app-error';
import { ViewStatisticsProjection } from '@/modules/view/application/view-statistics.projection';

describe('View contract commands', () => {
  it('records by global resource identity and returns aggregate count', async () => {
    const records = new Set<string>();
    const repository = {
      record: async (accountId: string, resourceId: string) => {
        records.add(`${accountId}:${resourceId}`);

        return { accountId, resourceId, createdAt: new Date().toISOString() };
      },
      count: async () => records.size,
    };
    const command = new RecordViewCommand(repository as never, { isViewable: async () => true } as never);
    await expect(command.execute('account-1', 'content-1')).resolves.toEqual({ resourceId: 'content-1', views: 1 });
  });

  it('statistics projection is keyed only by resourceId', async () => {
    const getCounts = vi.fn(async () => ({ 'content-1': 11 }));
    const setCount = vi.fn(async () => undefined);
    const projection = new ViewStatisticsProjection({ getCounts, setCount });
    await expect(projection.getCounts(['content-1'])).resolves.toEqual({ 'content-1': 11 });
    await projection.setCount('content-1', 12);
    expect(getCounts).toHaveBeenCalledWith(['content-1']);
    expect(setCount).toHaveBeenCalledWith('content-1', 12);
  });

  it('does not record a non-viewable resource', async () => {
    const record = vi.fn();
    const command = new RecordViewCommand(
      { record, count: async () => 0 } as never,
      { isViewable: async () => false } as never,
    );
    await expect(command.execute('account-1', 'content-1')).rejects.toThrowError(
      new AppError('CONTENT_INTERACTION_NOT_ALLOWED'),
    );
    expect(record).not.toHaveBeenCalled();
  });
});
