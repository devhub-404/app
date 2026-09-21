import { ready, server } from '@serenity-kit/opaque';
import { loadAppEnvironment } from '@/app/config/env-file';

loadAppEnvironment();
await ready;

if (!process.env.OPAQUE_SERVER_SETUP || /^(test-only|changeme)/.test(process.env.OPAQUE_SERVER_SETUP)) {
  process.env.OPAQUE_SERVER_SETUP = server.createSetup();
}
