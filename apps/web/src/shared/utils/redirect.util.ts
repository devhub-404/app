import { isServer } from '@utilify/core';
import { navigate } from 'astro:transitions/client';

export type RedirectTarget = string | URL;

export const redirectTo = (target: RedirectTarget) => {
  if (isServer()) return;

  const url = typeof target === 'string' ? target : target.toString();
  const resolved = new URL(url, window.location.href);
  if (resolved.origin === window.location.origin) {
    void navigate(`${resolved.pathname}${resolved.search}${resolved.hash}`);
    return;
  }
  window.location.href = resolved.toString();
};
