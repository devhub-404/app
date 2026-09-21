import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppResponses } from '@/app/http/app-response-catalog';

const swaggerConfig = new DocumentBuilder()
  .setTitle('DevHub 404 API')
  .setVersion('1.0')
  .addCookieAuth('devhub_session')
  .build();

function responseCode(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  if (Array.isArray(value)) {
    for (const item of value) {
      const code = responseCode(item);
      if (code) return code;
    }

    return undefined;
  }
  for (const [key, nested] of Object.entries(value)) {
    if (key === 'enum' && Array.isArray(nested) && nested.length === 1 && typeof nested[0] === 'string') {
      return nested[0];
    }
    const code = responseCode(nested);
    if (code) return code;
  }

  return undefined;
}

function normalizeResponseStatuses(document: OpenAPIObject): OpenAPIObject {
  for (const pathItem of Object.values(document.paths ?? {})) {
    for (const operation of Object.values(pathItem ?? {}) as unknown[]) {
      if (!operation || typeof operation !== 'object' || !('responses' in operation)) continue;
      const responses = operation.responses as Record<string, unknown>;
      for (const [status, response] of Object.entries(responses)) {
        const code = responseCode(response);
        const metadata = code ? AppResponses[code as keyof typeof AppResponses] : undefined;
        if (!metadata) continue;
        const normalizedStatus = String(metadata.status);
        if (normalizedStatus === status) continue;
        delete responses[status];
        responses[normalizedStatus] = response;
      }
    }
  }

  return document;
}

export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    autoTagControllers: true,
    deepScanRoutes: true,
    operationIdFactory: (controllerKey, methodKey, version) => {
      if (!version) return `${controllerKey}_${methodKey}`;
      const normalizedVersion = String(version).replace(/^v/i, '');

      return `${controllerKey}_${methodKey}_v${normalizedVersion}`;
    },
  });

  return normalizeResponseStatuses(document);
}

export function setupOpenApiDocs(app: INestApplication): void {
  SwaggerModule.setup('docs', app, () => buildOpenApiDocument(app));
}
