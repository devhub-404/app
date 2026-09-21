import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { AccountRepository } from '@/modules/account/application/ports/account.repository';
import { RoleRepository } from '@/modules/account/application/admin/ports/role.repository';
import type { AccountRoleName } from '@/modules/account/application/admin/types/account-role-name.type';
import { AccountRoleAssignmentResultDTO } from '@/modules/account/application/admin/dtos/out';

@Injectable()
export class AssignAccountRolesCommand {
  constructor(
    private readonly userRepository: AccountRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(targetUserId: string, roleName: AccountRoleName | null): Promise<AccountRoleAssignmentResultDTO> {
    const user = await this.userRepository.findById(targetUserId);
    if (!user) throw new AppError('USER_NOT_FOUND');

    const role = roleName ? await this.roleRepository.findByName(roleName) : null;
    if (roleName && !role) throw new AppError('USER_INVALID_ROLE');

    const replaced = await this.roleRepository.replaceUserRole(targetUserId, role?.id ?? null);
    if (!replaced) throw new AppError('USER_NOT_FOUND');

    return { userId: targetUserId, role: roleName };
  }
}
