import { Inject, Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { TotpSecretCryptoService } from '@/modules/auth/domain/services/totp-secret-crypto.service';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';

type Payload = {
  v: 1;
  iv: string;
  tag: string;
  ct: string;
};

function requireKey(raw: string): Buffer {
  if (!raw) throw new Error('Missing env AUTH_TOTP_SECRET_ENCRYPTION_KEY_BASE64');

  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error('AUTH_TOTP_SECRET_ENCRYPTION_KEY_BASE64 must be 32 bytes (base64-encoded)');
  }

  return key;
}

@Injectable()
export class AesGcmTotpSecretCryptoService implements TotpSecretCryptoService {
  private readonly key: Buffer;

  constructor(@Inject(AUTH_CONFIG) config: AuthConfig) {
    this.key = requireKey(config.auth.totpSecretEncryptionKeyBase64);
  }

  async encryptBase32Secret(secret: string): Promise<string> {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const ct = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    const payload: Payload = {
      v: 1,
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      ct: ct.toString('base64'),
    };

    return await Promise.resolve(Buffer.from(JSON.stringify(payload), 'utf8').toString('base64'));
  }

  async decryptBase32Secret(encryptedSecret: string): Promise<string> {
    const decoded = Buffer.from(encryptedSecret, 'base64').toString('utf8');
    const payload = JSON.parse(decoded) as Payload;
    if (payload.v !== 1) throw new Error('Unsupported encrypted secret version');

    const iv = Buffer.from(payload.iv, 'base64');
    const tag = Buffer.from(payload.tag, 'base64');
    const ct = Buffer.from(payload.ct, 'base64');

    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(tag);
    const pt = Buffer.concat([decipher.update(ct), decipher.final()]);

    return await Promise.resolve(pt.toString('utf8'));
  }
}
