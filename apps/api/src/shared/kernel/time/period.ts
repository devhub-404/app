export type Period = 'day' | 'week' | 'month' | 'year' | 'all';

const PERIOD_SECONDS: Record<Exclude<Period, 'all'>, number> = {
  day: 86_400,
  week: 604_800,
  month: 2_592_000,
  year: 31_536_000,
};

export function resolvePeriodLowerBound(period: Period | undefined, now = new Date()): Date | undefined {
  if (!period || period === 'all') return undefined;

  const currentMinute = Math.floor(now.getTime() / 60_000) * 60_000;

  return new Date(currentMinute - PERIOD_SECONDS[period] * 1000);
}
