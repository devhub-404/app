import { Logger } from '@nestjs/common';
import { createApp } from '@/app/create-app';
import { env } from '@/app/config/env';
import { BootstrapTiming } from '@/app/bootstrap-timing';

async function bootstrap() {
  const timing = new BootstrapTiming(env.bootstrapTimingEnabled);
  timing.checkpoint('bootstrap-entry');
  const app = await createApp(timing);
  timing.checkpoint('create-app');
  await timing.measure('http.listen', () =>
    app.listen(env.host ? { port: env.port, host: env.host } : { port: env.port }),
  );
  timing.checkpoint('bootstrap-complete');
  timing.log();
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown bootstrap error';
  Logger.error(message, undefined, 'Bootstrap');
  process.exitCode = 1;
});
