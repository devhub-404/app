import { expect, test, type Page } from "@playwright/test";
import { generateSync } from "otplib";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type TestAccount = {
  email: string;
  password: string;
  username: string;
  displayName: string;
  totpSecret?: string;
};

type MailEnvelope = {
  to: string[];
  urls: string[];
  createdAt: string;
};

const mailboxDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../../.local/e2e-mailbox",
);
const testApiUrl = process.env.E2E_API_URL ?? "http://localhost:3001";

function userMenu(page: Page) {
  return page.getByRole("button", { name: "Menu do usuário" }).first();
}

async function expectAuthenticatedSession(page: Page) {
  const session = await page.evaluate(async (apiUrl) => {
    const response = await fetch(`${apiUrl}/api/v1/me/details`, {
      credentials: "include",
    });

    return { status: response.status };
  }, testApiUrl);

  expect(session.status).toBe(200);
}

async function expectUnauthenticatedSession(page: Page) {
  const session = await page.evaluate(async (apiUrl) => {
    const response = await fetch(`${apiUrl}/api/v1/me/details`, {
      credentials: "include",
    });

    return { status: response.status };
  }, testApiUrl);

  expect(session.status).toBe(401);
}

async function waitForVerificationUrl(email: string, startedAt: number) {
  const deadline = Date.now() + 15_000;

  while (Date.now() < deadline) {
    let files: string[] = [];
    try {
      files = await readdir(mailboxDirectory);
    } catch {
      // The local email service creates the outbox lazily on the first message.
    }

    for (const file of files.filter((entry) => entry.endsWith(".json"))) {
      try {
        const envelope = JSON.parse(
          await readFile(resolve(mailboxDirectory, file), "utf8"),
        ) as MailEnvelope;
        if (
          envelope.to.includes(email) &&
          new Date(envelope.createdAt).getTime() >= startedAt &&
          envelope.urls.length > 0
        ) {
          return envelope.urls[0];
        }
      } catch {
        // The envelope may still be in the middle of being written.
      }
    }

    await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
  }

  throw new Error(`Verification email was not captured for ${email}`);
}

async function registerAndVerify(page: Page): Promise<TestAccount> {
  const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
  const account: TestAccount = {
    email: `e2e-${suffix}@devhub.local`,
    password: "E2E-Password-2026!",
    username: `e2e${suffix}`,
    displayName: `E2E User ${suffix}`,
  };
  const startedAt = Date.now();

  await page.goto("/signup");
  await page.locator("#signup-email").fill(account.email);
  await page.locator("#signup-password").fill(account.password);
  await page.locator("#signup-confirm").fill(account.password);
  await page.getByRole("button", { name: "Criar conta", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Verifique seu email" }),
  ).toBeVisible();

  const verificationUrl = await waitForVerificationUrl(
    account.email,
    startedAt,
  );
  await page.goto(verificationUrl);
  const verifiedMessage = page.getByText("Email verificado", { exact: false });
  try {
    await expect(verifiedMessage).toBeVisible({ timeout: 5_000 });
  } catch {
    // The first request can be aborted while Astro finishes compiling the
    // verification island in dev mode. Retry the same bearer URL once.
    await page.reload();
    await expect(verifiedMessage).toBeVisible();
  }

  return account;
}

async function signIn(page: Page, account: TestAccount) {
  await page.goto("/login?redirect=%2Faccount");
  await page.locator("#login-email").fill(account.email);
  await page.locator("#login-password").fill(account.password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();

  if (account.totpSecret) {
    const totp = page.getByLabel("Código do autenticador");
    await expect(totp).toBeVisible();
    await totp.fill(generateSync({ secret: account.totpSecret }));
    await page
      .getByRole("button", { name: "Confirmar código", exact: true })
      .click();
  }

  await expect(page).toHaveURL(/\/account(?:$|\?)/);
}

async function configureTotp(page: Page, account: TestAccount) {
  await page.goto("/account/security");
  await page
    .getByRole("button", { name: "Configurar TOTP", exact: true })
    .click();

  const secret = (await page.locator("#mfa-totp code").innerText()).trim();
  expect(secret).not.toBe("");

  await page.locator("#totp-enrollment-code").fill(generateSync({ secret }));
  const completion = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/v1/mfa/enroll/totp/complete") &&
      response.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Confirmar TOTP", exact: true })
    .click();
  const completionResponse = await completion;
  expect(completionResponse.ok()).toBe(true);
  const completionBody = (await completionResponse.json()) as {
    data?: { recoveryCodes?: string[] };
  };
  expect(completionBody.data?.recoveryCodes).toHaveLength(10);
  account.totpSecret = secret;
}

async function updateProfile(page: Page, account: TestAccount) {
  await page.goto("/account/profile");
  await expect(page.locator("#profile-username")).toBeVisible();
  await page.locator("#profile-username").fill(account.username);
  await page.locator("#profile-displayName").fill(account.displayName);
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(page.locator("#profile-username")).toHaveValue(account.username);
  await expect(page.locator("#profile-displayName")).toHaveValue(
    account.displayName,
  );
}

test.describe("autenticação no navegador", () => {
  test("protege rotas privadas para visitantes", async ({ page }) => {
    await page.goto("/account");

    await expect(page).toHaveURL(/\/login\?redirect=%2Faccount/);
    await expect(
      page.getByRole("button", { name: "Entrar", exact: true }).last(),
    ).toBeVisible();
  });

  test("cadastra, verifica, autentica, carrega o profile e sincroniza login e logout entre abas", async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: "pt-BR" });
    const pageA = await context.newPage();
    const pageB = await context.newPage();

    try {
      const account = await registerAndVerify(pageA);
      await pageB.goto("/articles");
      await expect(userMenu(pageB)).not.toBeVisible();

      await signIn(pageA, account);
      await expect(userMenu(pageA)).toBeVisible();
      await expectAuthenticatedSession(pageA);

      // Login in pageA must resolve /me and update the already-open pageB.
      await expect(userMenu(pageB)).toBeVisible();
      await expectAuthenticatedSession(pageB);
      await pageB.goto("/account/profile");
      await updateProfile(pageB, account);
      await expect(pageB.locator("#profile-displayName")).toHaveValue(
        account.displayName,
      );

      await configureTotp(pageB, account);

      await userMenu(pageA).click();
      await pageA.getByRole("menuitem", { name: "Sair", exact: true }).click();
      await expect(pageA).toHaveURL(/\/login/);
      await expectUnauthenticatedSession(pageA);

      // Logout in pageA must clear pageB and protect its current private route.
      await expect(pageB).toHaveURL(/\/login/);
      await expect(userMenu(pageB)).not.toBeVisible();
      await expectUnauthenticatedSession(pageB);

      // The next password login must require and accept the newly configured TOTP.
      await signIn(pageA, account);
      await expect(userMenu(pageA)).toBeVisible();
      await expectAuthenticatedSession(pageA);
    } finally {
      await context.close();
    }
  });

  test("rejeita credenciais inválidas sem criar sessão", async ({ page }) => {
    await page.goto("/login");
    await page
      .locator("#login-email")
      .fill(`missing-${randomUUID()}@devhub.local`);
    await page.locator("#login-password").fill("senha-incorreta");
    await page.getByRole("button", { name: "Entrar", exact: true }).click();

    await expect(page.getByRole("alert").last()).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
    await expect(userMenu(page)).not.toBeVisible();
  });
});
