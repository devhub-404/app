/** Canonical representation used for identity lookup and persistence. */
export function canonicalizeEmailAddress(email: string): string {
  return email.trim().toLowerCase();
}
