import { randomBytes } from 'node:crypto';

export function generateUsername(): string {
  const suffix = randomBytes(4).toString('hex');

  return `user_${suffix}`;
}
