import { defineAuthPersistenceCases } from './support/persistence/auth.cases';
import './support/auth/account-recovery.cases';
import './support/auth/magic-link.cases';
import './support/auth/mfa-totp.cases';
import './support/auth/oauth-login.cases';
import './support/auth/passkey-login.cases';
import './support/auth/password-login.cases';
import './support/auth/sessions.cases';
import { afterAll } from 'vitest';
import { closeSharedAuthApp } from './support/auth/shared-app';

afterAll(async () => {
  await closeSharedAuthApp();
});

// Normative source: docs/domains/auth/REFS.md.
defineAuthPersistenceCases();
