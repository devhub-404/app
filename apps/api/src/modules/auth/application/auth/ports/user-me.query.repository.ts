import type { UserMeDTO } from '@/modules/auth/application/auth/dtos/out/user-me.dto';

export abstract class UserMeQueryRepository {
  abstract findByUserIdAndSessionId(userId: string, sessionId: string): Promise<UserMeDTO | null>;
}
