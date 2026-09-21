const url = process.argv[2] ?? 'http://127.0.0.1:8080/api/v1/platform/readiness';
const timeoutMs = Number(process.argv[3] ?? 180_000);
const startedAt = Date.now();

while (Date.now() - startedAt < timeoutMs) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1_000) });
    if (response.ok) {
      const body = await response.json().catch(() => null);
      if (body?.data?.ready === true) process.exit(0);
    }
  } catch {
    // The API Wrangler session or its container may still be starting.
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
}

console.error(`API did not become ready within ${timeoutMs}ms: ${url}`);
process.exit(1);
