export function getTestDatabaseUrl(): string {
  const url = process.env.DB_PRIMARY_URL;
  if (!url) throw new Error('DB_PRIMARY_URL is required for database-backed tests');
  if (!/\/devhub_test(?:\?|$)/.test(url)) {
    throw new Error(`Refusing to run database-backed tests against a non-test database: ${url}`);
  }

  return url;
}
