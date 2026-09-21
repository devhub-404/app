import { Reflector } from '@nestjs/core';
import type { Role } from '@/shared/kernel/auth/role';

export const Roles = Reflector.createDecorator<Role[]>();
