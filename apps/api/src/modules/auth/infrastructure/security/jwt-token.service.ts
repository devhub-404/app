import { Inject, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import {
  SignOptions,
  SignPayload,
  TokenService,
  VerifyOptions,
} from '@/modules/auth/application/shared/ports/token.service';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private jwtService: JwtService,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  async verify<T extends object>(token: string, options?: VerifyOptions): Promise<T> {
    return await this.jwtService.verifyAsync<T>(token, {
      ...(options ?? {}),
      secret: options?.secret ?? this.config.jwtSecret,
    });
  }

  async sign(payload: SignPayload, options?: SignOptions): Promise<string> {
    // DTO instances are useful for validation, but jsonwebtoken accepts only a
    // plain object as its payload.
    return await this.jwtService.signAsync(
      { ...payload },
      {
        ...(options as JwtSignOptions),
        secret: options?.secret ?? this.config.jwtSecret,
      },
    );
  }
}
