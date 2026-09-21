export const PLATFORM_ROLE_NAMES = ['curator', 'admin', 'moderator'] as const;

export type AccountRoleName = (typeof PLATFORM_ROLE_NAMES)[number];
