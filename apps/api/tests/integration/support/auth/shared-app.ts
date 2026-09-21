import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createApp } from '@/app/create-app';

let appPromise: Promise<NestFastifyApplication> | undefined;

export function getSharedAuthApp(): Promise<NestFastifyApplication> {
  appPromise ??= (async () => {
    const app = await createApp();
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    return app;
  })();

  return appPromise;
}

export async function closeSharedAuthApp(): Promise<void> {
  const app = await appPromise;
  appPromise = undefined;
  await app?.close();
}
