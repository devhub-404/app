import type { components } from '@devhub-404/api-contract';

export type AuthenticationTransportDTO =
  | components['schemas']['PasswordLoginCompleteDTO']
  | components['schemas']['PasskeyLoginDTO']
  | components['schemas']['MagicLinkLoginDTO']
  | components['schemas']['OAuthLoginDTO']
  | components['schemas']['MfaRecoveryCodeSessionDTO'];

/** Stable application projection shared by the authentication UI flows. */
export type LoginResult = {
  reactivationToken?: string;
  restoreAccessRequested?: true;
  emailVerificationRequested?: true;
  mfaRequired?: true;
  token?: string;
  methods?: string[];
  redirect?: string | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

/**
 * Map generated transport variants into the one representation the auth UI needs.
 * Unknown or contract-incompatible fields are ignored instead of being promoted to
 * the application contract. In particular, OpenAPI currently does not define the
 * magic-link `redirect` field as a string.
 */
export function toLoginResult(dto: AuthenticationTransportDTO | null | undefined): LoginResult | undefined {
  const value = asRecord(dto);
  if (!value) return undefined;

  return {
    ...(typeof value['reactivationToken'] === 'string' ? { reactivationToken: value['reactivationToken'] } : {}),
    ...(value['restoreAccessRequested'] === true ? { restoreAccessRequested: true as const } : {}),
    ...(value['emailVerificationRequested'] === true ? { emailVerificationRequested: true as const } : {}),
    ...(value['mfaRequired'] === true ? { mfaRequired: true as const } : {}),
    ...(typeof value['token'] === 'string' ? { token: value['token'] } : {}),
    ...(Array.isArray(value['methods']) && value['methods'].every((method) => typeof method === 'string')
      ? { methods: value['methods'] as string[] }
      : {}),
    ...(typeof value['redirect'] === 'string' ? { redirect: value['redirect'] } : {}),
  };
}
