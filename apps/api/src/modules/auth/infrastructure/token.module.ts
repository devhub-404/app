import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtTokenService } from '@/modules/auth/infrastructure/security/jwt-token.service';
import { TokenService } from '@/modules/auth/application/shared/ports/token.service';

@Module({
  imports: [JwtModule.register({})],
  exports: [TokenService],
  providers: [
    {
      provide: TokenService,
      useClass: JwtTokenService,
    },
  ],
})
export class TokenModule {}
