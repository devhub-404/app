type PublicMediaConfig = { storage: { publicBaseUrl: string } };

export function resolvePublicMediaUrl(objectKey: string | null, config: PublicMediaConfig): string | null {
  if (!objectKey || !config.storage.publicBaseUrl) return null;

  return new URL(objectKey, config.storage.publicBaseUrl).toString();
}
