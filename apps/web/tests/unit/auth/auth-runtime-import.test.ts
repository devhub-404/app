import { afterEach, beforeEach, expect, test, vi } from "vitest";

vi.mock(
  "astro:env/client",
  () => ({
    APP_ENV: "test",
    API_URL: "http://127.0.0.1:8080",
    PUBLIC_GITHUB_REPO_NAME: "app",
    PUBLIC_GITHUB_REPO_OWNER: "devhub-404",
    PUBLIC_GITHUB_SPONSOR_URL: "",
    PUBLIC_DISCORD_URL: "",
  }),
  // @ts-ignore Vitest supports the virtual-module overload at runtime.
  { virtual: true },
);

let randomUuid: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.resetModules();
  randomUuid = vi.spyOn(globalThis.crypto, "randomUUID");
});

afterEach(() => {
  randomUuid.mockRestore();
});

test("does not create the client auth runtime while importing the SSR bundle", async () => {
  await import("../../../src/features/auth/runtime/auth-runtime.ts");

  expect(randomUuid).not.toHaveBeenCalled();
});

test("does not allow the lifecycle bus to be created on the server", async () => {
  const { createAuthSessionLifecycleBus } = await import(
    "../../../src/features/auth/runtime/session-sync.ts"
  );

  expect(() => createAuthSessionLifecycleBus()).toThrow(
    "only be created in the browser",
  );
});
