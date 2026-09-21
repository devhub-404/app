import { Injectable } from '@nestjs/common';
import { randomInt, randomUUID } from 'node:crypto';
import { AUTH_TOKEN_AUDIENCE, TokenService } from '@/modules/auth/application/shared/ports/token.service';
import { JwtTokenType } from '@/modules/auth/application/shared/dto';
import { parseJwtPayload } from '@/modules/auth/application/shared/dto';
import { AuthSecretDigestService } from '@/modules/auth/domain/services/auth-secret-digest.service';
import {
  AuthFlowProofRepository,
  type AuthFlowProofRow,
  type AuthFlowProofPurpose,
} from '@/modules/auth/application/shared/ports/auth-flow-proof.repository';

type SignInput = {
  type: JwtTokenType;
  payload: Record<string, unknown>;
  expiresIn: string | number;
};

type SingleUseSignInput = SignInput & {
  purpose: AuthFlowProofPurpose;
  subjectId?: string | null;
};

type TrackedProof = {
  jti: string;
  sub?: string;
};

function ttlMilliseconds(value: string | number): number {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value <= 0) throw new Error('Invalid token TTL');

    // jsonwebtoken-style numeric expiresIn is seconds.
    return value * 1000;
  }

  const match = /^(\d+)(s|m|h|d)$/.exec(value.trim());
  if (!match) throw new Error(`Unsupported token TTL: ${value}`);
  const amount = Number(match[1]);
  const unit = match[2];
  const multiplier = unit === 's' ? 1000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;

  return amount * multiplier;
}

function asTrackedProof(value: object): TrackedProof {
  const proof = value as Partial<TrackedProof>;
  if (
    typeof proof.jti !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(proof.jti)
  ) {
    throw new Error('Invalid single-use proof JTI');
  }
  if (proof.sub !== undefined && typeof proof.sub !== 'string') {
    throw new Error('Invalid single-use proof subject');
  }

  return proof as TrackedProof;
}

@Injectable()
export class FlowTokenService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly authFlowProofRepository: AuthFlowProofRepository,
    private readonly authSecretDigestService: AuthSecretDigestService,
  ) {}

  async sign(input: SignInput): Promise<string> {
    return await this.tokenService.sign(
      { type: input.type, ...input.payload },
      {
        expiresIn: input.expiresIn,
        audience: AUTH_TOKEN_AUDIENCE,
      },
    );
  }

  async signSingleUse(input: SingleUseSignInput): Promise<string> {
    if (String(input.type) !== input.purpose) {
      throw new Error(`Single-use proof purpose mismatch: ${input.type} != ${input.purpose}`);
    }

    const jti = randomUUID();
    const token = await this.tokenService.sign(
      { type: input.type, ...input.payload, jti },
      {
        expiresIn: input.expiresIn,
        audience: AUTH_TOKEN_AUDIENCE,
      },
    );

    const payloadSubject = typeof input.payload['sub'] === 'string' ? input.payload['sub'] : null;
    await this.authFlowProofRepository.create({
      jti,
      purpose: input.purpose,
      subjectId: input.subjectId ?? payloadSubject,
      expiresAt: new Date(Date.now() + ttlMilliseconds(input.expiresIn)),
    });

    return token;
  }

  async signSingleUseCode(input: {
    purpose: AuthFlowProofPurpose;
    subjectId: string;
    expiresIn: string | number;
  }): Promise<string> {
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const jti = randomUUID();
    const codeHash = await this.authSecretDigestService.hash(code);

    await this.authFlowProofRepository.create({
      jti,
      purpose: input.purpose,
      subjectId: input.subjectId,
      codeHash,
      expiresAt: new Date(Date.now() + ttlMilliseconds(input.expiresIn)),
    });

    return code;
  }

  async verify<T extends object>(Dto: new () => T, token: string): Promise<T> {
    const payload = await this.tokenService.verify(token, { audience: AUTH_TOKEN_AUDIENCE });

    return parseJwtPayload(Dto, payload);
  }

  async verifySingleUse<T extends object>(
    Dto: new () => T,
    token: string,
    purpose: AuthFlowProofPurpose,
  ): Promise<T & TrackedProof> {
    const payload = await this.tokenService.verify(token, { audience: AUTH_TOKEN_AUDIENCE });
    const parsed = parseJwtPayload(Dto, payload);
    const tracked = asTrackedProof(parsed);

    const usable = await this.authFlowProofRepository.findUsable({
      jti: tracked.jti,
      purpose,
    });
    if (!usable) throw new Error('Single-use proof is expired or already consumed');

    return parsed as T & TrackedProof;
  }

  async consumeSingleUse(payload: object, purpose: AuthFlowProofPurpose): Promise<boolean> {
    const tracked = asTrackedProof(payload);

    return await this.authFlowProofRepository.consume({
      jti: tracked.jti,
      purpose,
    });
  }

  async verifySingleUseCode(purpose: AuthFlowProofPurpose, subjectId: string, code: string): Promise<AuthFlowProofRow> {
    if (!/^\d{6}$/.test(code)) throw new Error('Invalid single-use proof code');

    const codeHash = await this.authSecretDigestService.hash(code);
    const proof = await this.authFlowProofRepository.findUsableByCodeHash({ purpose, subjectId, codeHash });
    if (!proof) throw new Error('Single-use proof is expired or already consumed');

    return proof;
  }
}
