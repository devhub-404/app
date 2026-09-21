export abstract class TotpSecretCryptoService {
  abstract encryptBase32Secret(secret: string): Promise<string>;
  abstract decryptBase32Secret(encryptedSecret: string): Promise<string>;
}
