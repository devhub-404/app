export type ApiPayload<T = unknown> = {
  data?: T;
  message?: string;
  code?: string;
};

export type ApiResult<T = unknown> = {
  data?: ApiPayload<T>;
  error?: ApiPayload<unknown>;
  response?: Response;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export function readApiData<T>(response: unknown): T | undefined {
  if (!response || typeof response !== 'object') return undefined;
  const payload = (response as { data?: unknown }).data;
  if (!payload || typeof payload !== 'object') return undefined;
  return (payload as { data?: T }).data;
}
