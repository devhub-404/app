import { z } from 'zod';
import type { UserListItemDTO } from '@/features/panel/types/panel.type.ts';

const identity = z.record(z.string(), z.unknown()).nullable();

export const accountAdminUserSchema: z.ZodType<UserListItemDTO> = z.object({
  id: z.string(),
  voluntaryStatus: z.enum(['active', 'deactivated']),
  moderationStatus: z.enum(['none', 'suspended', 'banned']),
  deletionStatus: z.enum(['none', 'pending']),
  deletionRequestedAt: z.string().nullable(),
  status: z.enum(['active', 'deactivated', 'suspended', 'banned']),
  mfaEnabled: z.boolean(),
  lockedUntil: z.string().nullable(),
  email: identity,
  username: identity,
  role: z.enum(['curator', 'admin', 'moderator']).nullable(),
  createdAt: z.string(),
});
