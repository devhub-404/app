import type { AccountRoleName } from '@/modules/account/application/admin/types/account-role-name.type';

export abstract class RoleRepository {
  abstract findByName(name: AccountRoleName): Promise<{ id: string; name: AccountRoleName } | null>;
  abstract replaceUserRole(userId: string, roleId: string | null): Promise<boolean>;
  abstract findNameByUserId(userId: string): Promise<AccountRoleName | null>;
}
