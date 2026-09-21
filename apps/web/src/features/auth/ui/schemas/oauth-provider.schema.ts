import type { OAuthProvider } from '@/features/auth/types/auth.type.ts';
export function isOAuthProvider(value: string): value is OAuthProvider {
  return value === 'github' || value === 'google';
}
