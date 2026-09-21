import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { TotpService } from '@/modules/auth/domain/services/totp.service';
import { loadOtplib } from '@/modules/auth/infrastructure/auth-sdk';

@Injectable()
export class OtplibTotpService implements TotpService {
  generateBase32Secret(): string {
    return loadOtplib().generateSecret();
  }

  generateOtpAuthUri(input: { issuer: string; accountName: string; secret: string }): string {
    return loadOtplib().generateURI({
      issuer: input.issuer,
      label: input.accountName,
      secret: input.secret,
    });
  }

  verifyToken(input: { token: string; secret: string; window?: number }): boolean {
    const epochTolerance = (input.window ?? 0) * 30;
    const result = loadOtplib().verifySync({ token: input.token, secret: input.secret, epochTolerance });

    return result.valid === true;
  }

  generateBackupCodes(input?: { count?: number; bytes?: number }): string[] {
    const count = input?.count ?? 10;
    const bytes = input?.bytes ?? 8;

    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(randomBytes(bytes).toString('hex'));
    }

    return codes;
  }
}
