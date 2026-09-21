import type { UserListItemDTO } from './panel.type.ts';
import { accountAdminUserSchema } from '@/features/panel/ui/schemas/account-admin.schema.ts';

/**
 * GET /api/v1/accounts/{id} is currently typed as `unknown | null` by OpenAPI.
 * Validate the projection required by Panel at this boundary instead of asserting
 * that the undocumented payload matches AccountAdminUserDTO.
 */
export function toAccountAdminUser(value: unknown): UserListItemDTO | null {
  const parsed = accountAdminUserSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
