import assert from 'node:assert/strict';
import { test } from 'vitest';
import { createAuthSchemas } from '../../../src/features/auth/ui/schemas/forms.schema.ts';
import { createMagicLinkSchema } from '../../../src/features/auth/ui/schemas/magic-link.schema.ts';
import { isOAuthProvider } from '../../../src/features/auth/ui/schemas/oauth-provider.schema.ts';

test('auth forms accept valid credentials and reject invalid values', () => {
  const schemas = createAuthSchemas('en');

  assert.equal(schemas.login.safeParse({ email: 'user@example.com', password: 'password-123' }).success, true);
  assert.equal(schemas.login.safeParse({ email: 'invalid', password: 'password-123' }).success, false);
  assert.equal(
    schemas.signup.safeParse({
      email: 'user@example.com',
      password: 'password-123',
      confirmPassword: 'different-password',
    }).success,
    false,
  );
  assert.deepEqual(
    schemas.signup.parse({ email: 'user@example.com', password: 'password-123', confirmPassword: 'password-123' }),
    { email: 'user@example.com', password: 'password-123' },
  );
});

test('password recovery form validates both steps and produces API input', () => {
  const schema = createAuthSchemas('en').resetPassword;

  assert.deepEqual(schema.parse({ token: 'reset-token', password: 'password-123', confirmPassword: 'password-123' }), {
    verify: { token: 'reset-token' },
    confirm: { password: 'password-123' },
  });
  assert.equal(schema.safeParse({ token: '', password: 'password-123', confirmPassword: 'password-123' }).success, false);
});

test('all auxiliary authentication schemas validate their individual payloads', () => {
  const schemas = createAuthSchemas('en');

  assert.equal(schemas.forgotPassword.safeParse({ email: 'user@example.com' }).success, true);
  assert.equal(schemas.accountRecoveryStart.safeParse({ email: 'user@example.com' }).success, true);
  assert.equal(schemas.resendVerification.safeParse({ email: 'user@example.com' }).success, true);
  assert.equal(schemas.mfaTotp.safeParse({ code: '123456' }).success, true);
  assert.equal(schemas.mfaRecovery.safeParse({ code: 'recovery-code' }).success, true);
  assert.equal(schemas.verifyPasswordReset.safeParse({ token: 'token' }).success, true);
  assert.equal(schemas.confirmPasswordReset.safeParse({ password: 'password-123' }).success, true);
});

test('magic-link form and OAuth provider form guard accept supported inputs only', () => {
  assert.equal(createMagicLinkSchema('en').safeParse({ email: 'user@example.com', redirect: '/account' }).success, true);
  assert.equal(createMagicLinkSchema('en').safeParse({ email: 'invalid' }).success, false);
  assert.equal(isOAuthProvider('github'), true);
  assert.equal(isOAuthProvider('google'), true);
  assert.equal(isOAuthProvider('twitter'), false);
});
