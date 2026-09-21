export type CredentialOwnershipRow = {
  id: string;
  userId: string;
  type: 'password' | 'oauth' | 'passkey';
};
import {
  CreateCredentialDTO,
  CreateOAuthCredentialDTO,
  CreatePasswordCredentialDTO,
  CreatePasskeyCredentialDTO,
} from '@/modules/auth/application/shared/dtos/internal/credential-command.dto';

export abstract class CredentialRepository {
  abstract create(input: CreateCredentialDTO): Promise<{ id: string }>;

  abstract createPassword(input: CreatePasswordCredentialDTO): Promise<{ id: string }>;
  abstract createOAuth(input: CreateOAuthCredentialDTO): Promise<{ id: string }>;
  abstract createPasskey(input: CreatePasskeyCredentialDTO): Promise<{ id: string }>;

  abstract updateLastUsedAt(id: string): Promise<void>;
  abstract deleteById(id: string): Promise<void>;
  abstract findById(id: string): Promise<CredentialOwnershipRow | null>;
  abstract countByUserId(userId: string): Promise<number>;
  abstract deleteByUserId(userId: string): Promise<void>;
}
