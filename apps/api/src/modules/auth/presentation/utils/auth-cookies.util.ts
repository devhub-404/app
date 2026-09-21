import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  isSessionSecret,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from '@/modules/auth/application/sessions/session-policy';

export const isSecureCookie = (secureCookies: boolean): boolean => secureCookies;

export const getSessionSecretFromRequest = (request: FastifyRequest): string | null => {
  const token = request.cookies?.[SESSION_COOKIE_NAME];

  return isSessionSecret(token) ? token : null;
};

export const setSessionCookie = (reply: FastifyReply, token: string, secureCookies: boolean): void => {
  if (!isSessionSecret(token)) throw new Error('Invalid session secret');

  reply.setCookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureCookie(secureCookies),
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
};

export const clearSessionCookie = (reply: FastifyReply, secureCookies: boolean): void => {
  reply.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureCookie(secureCookies),
    path: '/',
  });
};

export type OAuthBrowserContext = { state: string; codeVerifier: string };
export type OAuthBrowserFlow = 'login' | 'link';
export type OAuthBrowserProvider = 'github' | 'google';

const oauthContextCookieName = (flow: OAuthBrowserFlow, provider: OAuthBrowserProvider): string =>
  `oauth_${flow}_${provider}_context`;

export const setOAuthBrowserContextCookie = (
  reply: FastifyReply,
  flow: OAuthBrowserFlow,
  provider: OAuthBrowserProvider,
  context: OAuthBrowserContext,
  secureCookies: boolean,
): void => {
  reply.setCookie(oauthContextCookieName(flow, provider), `${context.state}.${context.codeVerifier}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureCookie(secureCookies),
    path: '/',
    maxAge: 10 * 60,
  });
};

export const getOAuthBrowserContextFromRequest = (
  request: FastifyRequest,
  flow: OAuthBrowserFlow,
  provider: OAuthBrowserProvider,
): OAuthBrowserContext | null => {
  const value = request.cookies?.[oauthContextCookieName(flow, provider)];
  if (typeof value !== 'string') return null;
  const separator = value.indexOf('.');
  if (separator <= 0 || separator === value.length - 1) return null;
  const state = value.slice(0, separator);
  const codeVerifier = value.slice(separator + 1);
  if (!/^[A-Za-z0-9_-]{20,128}$/.test(state)) return null;
  if (!/^[A-Za-z0-9_-]{43,128}$/.test(codeVerifier)) return null;

  return { state, codeVerifier };
};

export const clearOAuthBrowserContextCookie = (
  reply: FastifyReply,
  flow: OAuthBrowserFlow,
  provider: OAuthBrowserProvider,
  secureCookies: boolean,
): void => {
  reply.clearCookie(oauthContextCookieName(flow, provider), {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureCookie(secureCookies),
    path: '/',
  });
};
