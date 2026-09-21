export abstract class TotpService {
  abstract generateBase32Secret(): string;
  abstract generateOtpAuthUri(input: { issuer: string; accountName: string; secret: string }): string;
  abstract verifyToken(input: { token: string; secret: string; window?: number }): boolean;
  abstract generateBackupCodes(input?: { count?: number; bytes?: number }): string[];
}
