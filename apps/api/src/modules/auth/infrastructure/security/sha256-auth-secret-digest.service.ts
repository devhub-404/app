import { Injectable } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'node:crypto';
import { AuthSecretDigestService } from '@/modules/auth/domain/services/auth-secret-digest.service';

@Injectable()
export class Sha256AuthSecretDigestService extends AuthSecretDigestService {
  hash(secret: string): Promise<string> {
    return Promise.resolve(createHash('sha256').update(secret, 'utf8').digest('hex'));
  }

  async compare(secret: string, digest: string): Promise<boolean> {
    const computed = await this.hash(secret);
    const a = Buffer.from(computed, 'hex');
    const b = Buffer.from(digest, 'hex');
    if (a.length !== b.length) return false;

    return timingSafeEqual(a, b);
  }
}
