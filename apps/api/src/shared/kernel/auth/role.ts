export enum Role {
  CURATOR = 'curator',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export function hasRole(role: Role | null | undefined, expected: Role): boolean {
  return role === expected;
}

export function hasAnyRole(role: Role | null | undefined, ...expected: Role[]): boolean {
  return role !== null && role !== undefined && expected.includes(role);
}

export function hasEditorialAuthority(role: Role | null | undefined): boolean {
  return hasAnyRole(role, Role.CURATOR, Role.ADMIN);
}

export function hasModerationAuthority(role: Role | null | undefined): boolean {
  return hasAnyRole(role, Role.MODERATOR, Role.ADMIN);
}
