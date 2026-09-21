import { z } from 'zod';
import type { ForgotPasswordDTO } from '@/features/auth/types/auth.type.ts';
import type { LoginInput, RegisterInput, ResetPasswordInput } from '@/features/auth/types';
import { translate } from '@/features/auth/i18n';
import type { Locale } from '@/shared/i18n/core';

type VerifyPasswordResetInput = Pick<ResetPasswordInput, 'token'>;
type ResetPasswordValue = Pick<ResetPasswordInput, 'password'>;
type SignupFormInput = RegisterInput & { confirmPassword: string };
type ResetPasswordFormInput = ResetPasswordInput & { confirmPassword: string };

function fields(locale: Locale) {
  return {
    email: z
      .string()
      .trim()
      .pipe(z.email(translate(locale, 'validation.emailInvalid')).max(255, translate(locale, 'validation.emailLong'))),
    password: z
      .string()
      .min(8, translate(locale, 'validation.passwordShort'))
      .max(255, translate(locale, 'validation.passwordLong')),
    confirmPassword: z.string().min(1, translate(locale, 'validation.confirmPassword')),
    token: z.string().trim().min(1, translate(locale, 'validation.tokenRequired')),
    code: z.string().trim().min(1, translate(locale, 'validation.codeRequired')),
  };
}

export function createAuthSchemas(locale: Locale) {
  const f = fields(locale);
  const login = z.object({ email: f.email, password: f.password }) satisfies z.ZodType<LoginInput>;
  const forgotPassword = z.object({ email: f.email }) satisfies z.ZodType<ForgotPasswordDTO>;
  const accountRecoveryStart = z.object({ email: f.email });
  const resendVerification = z.object({ email: f.email });
  const mfaTotp = z.object({ code: f.code });
  const mfaRecovery = z.object({ code: f.code });
  const verifyPasswordReset = z.object({ token: f.token }) satisfies z.ZodType<VerifyPasswordResetInput>;
  const confirmPasswordReset = z.object({ password: f.password }) satisfies z.ZodType<ResetPasswordValue>;
  const signup = z
    .object({ email: f.email, password: f.password, confirmPassword: f.confirmPassword })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword)
        ctx.addIssue({
          code: 'custom',
          message: translate(locale, 'validation.passwordMismatch'),
          path: ['confirmPassword'],
        });
    })
    .transform(({ confirmPassword: _confirmPassword, ...dto }) => dto) satisfies z.ZodType<
    RegisterInput,
    SignupFormInput
  >;
  const resetPassword = z
    .object({ token: f.token, password: f.password, confirmPassword: f.confirmPassword })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword)
        ctx.addIssue({
          code: 'custom',
          message: translate(locale, 'validation.passwordMismatch'),
          path: ['confirmPassword'],
        });
    })
    .transform(({ token, password }) => ({ verify: { token }, confirm: { password } })) satisfies z.ZodType<
    ResetPasswordFormData,
    ResetPasswordFormInput
  >;
  return {
    login,
    forgotPassword,
    accountRecoveryStart,
    resendVerification,
    mfaTotp,
    mfaRecovery,
    verifyPasswordReset,
    confirmPasswordReset,
    signup,
    resetPassword,
  };
}

export type ResetPasswordFormData = { verify: VerifyPasswordResetInput; confirm: ResetPasswordValue };

// Portuguese defaults preserve the public schema API for non-UI callers; forms
// use createAuthSchemas(locale) so validation text follows the rendered locale.
const defaults = createAuthSchemas('pt');
export const loginSchema = defaults.login;
export const forgotPasswordSchema = defaults.forgotPassword;
export const verifyPasswordResetSchema = defaults.verifyPasswordReset;
export const confirmPasswordResetSchema = defaults.confirmPasswordReset;
export const signupSchema = defaults.signup;
export const resetPasswordSchema = defaults.resetPassword;
