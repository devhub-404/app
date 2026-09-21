export abstract class AuthSecretDigestService {
  abstract hash(secret: string): Promise<string>;
  abstract compare(secret: string, digest: string): Promise<boolean>;
}
