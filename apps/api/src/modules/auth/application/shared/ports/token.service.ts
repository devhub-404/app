export const AUTH_TOKEN_AUDIENCE = 'devhub-api';

export type VerifyOptions = {
  secret?: string;
  audience?: string;
};

export type SignPayload = {
  sub?: string;
  sid?: string;
  type: string;
} & Record<string, any>;

export type SignOptions = {
  expiresIn?: string | number;
  secret?: string;
  audience?: string;
};

export abstract class TokenService {
  abstract verify<T extends object>(token: string, options?: VerifyOptions): Promise<T>;
  abstract sign(payload: SignPayload, options?: SignOptions): Promise<string>;
}
