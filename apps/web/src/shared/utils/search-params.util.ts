export const syncSearchParam = (url: URL, key: string, value?: string): void => {
  if (value) url.searchParams.set(key, value);
  else url.searchParams.delete(key);
};
