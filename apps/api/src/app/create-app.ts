import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { createRequire } from 'node:module';
import fastifyCookie from '@fastify/cookie';
import { AppModule } from '@/app/app.module';
import CatchFilter from '@/app/http/filters/catch.filter';
import FormatResponseInterceptor from '@/app/http/interceptors/format-response.interceptor';
import { env } from '@/app/config/env';
import { setupOpenApiDocs } from '@/app/openapi';
import { BootstrapTiming } from '@/app/bootstrap-timing';

const requireFromApp = createRequire(import.meta.url);
const requireFromPlatform = createRequire(requireFromApp.resolve('@nestjs/platform-fastify'));
const { LogController: FastifyLogController } = requireFromPlatform('fastify') as typeof import('fastify');

export async function createApp(timing = new BootstrapTiming(false)): Promise<NestFastifyApplication> {
  const adapter = new FastifyAdapter({
    bodyLimit: 1024 * 1024,
    logger: env.logLevel !== 'silent',
    logController: new FastifyLogController({ disableRequestLogging: env.appEnv === 'production' }),
    trustProxy: true,
  });
  adapter.getInstance().addHook('onSend', async (_request, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  });
  timing.checkpoint('fastify-adapter');
  const app = await timing.measure('nest-factory.create', () =>
    NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
      logger: env.logLevel === 'debug' ? ['error', 'warn', 'log', 'debug', 'verbose'] : ['error', 'warn', 'log'],
    }),
  );

  await app.register(fastifyCookie);
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, prefix: 'v' });
  app.enableCors({
    origin: env.siteUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: 'Content-Type',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new CatchFilter());
  app.enableShutdownHooks();
  const reflector = new Reflector();
  app.useGlobalInterceptors(new FormatResponseInterceptor(reflector));

  if (env.openApiEnabled) {
    setupOpenApiDocs(app);
  }

  timing.checkpoint('application-configuration');

  return app;
}
