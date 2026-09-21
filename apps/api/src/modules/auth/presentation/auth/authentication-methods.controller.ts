import { Controller, Get, UseGuards, Version } from '@nestjs/common';
import { AuthGuard } from '@/modules/auth/public/http';
import { User } from '@/modules/auth/public/http';
import type { AuthenticatedPrincipalDTO } from '@/modules/auth/public/http';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { GetCurrentUserQuery } from '@/modules/auth/application/auth/use-cases/query/get-current-user.query';
import { AuthenticationMethodDTO } from '@/modules/auth/application/auth/dtos/out';

@Controller()
@UseGuards(AuthGuard)
export class AuthenticationMethodsController {
  constructor(private readonly getCurrentUserQuery: GetCurrentUserQuery) {}

  @Version('1')
  @Get('authentication-methods')
  @AppResponse('AUTHENTICATION_METHODS_RETRIEVED', AuthenticationMethodDTO, { isArray: true })
  async list(@User() user: AuthenticatedPrincipalDTO): Promise<AuthenticationMethodDTO[]> {
    const current = await this.getCurrentUserQuery.execute({ userId: user.sub, sessionId: user.sid });
    const primaryEmail = current.emails.find((email) => email.type === 'primary')?.email ?? null;
    const credentialCount = current.credentials.length;

    return current.credentials.flatMap<AuthenticationMethodDTO>((credential) => {
      if (credential.details?.type === 'oauth') {
        return [
          {
            id: credential.id,
            provider: credential.details.provider,
            providerEmail: primaryEmail,
            createdAt: credential.createdAt,
            canRemove: credentialCount > 1,
          },
        ];
      }
      if (credential.details?.type === 'password') {
        return [
          {
            id: credential.id,
            provider: 'local' as const,
            providerEmail: primaryEmail,
            createdAt: credential.createdAt,
            canRemove: false,
          },
        ];
      }
      if (credential.details?.type === 'passkey') {
        return [
          {
            id: credential.id,
            provider: 'passkey' as const,
            providerEmail: null,
            createdAt: credential.createdAt,
            canRemove: credentialCount > 1,
          },
        ];
      }

      return [];
    });
  }
}
