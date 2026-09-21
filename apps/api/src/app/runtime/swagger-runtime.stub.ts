/*
 * The production server does not expose OpenAPI. Keep the decorators callable
 * while replacing Swagger's runtime metadata work in the production bundle.
 * Development, tests, and openapi:generate resolve the real package.
 */

type Decorator = (...args: unknown[]) => void;

const noopDecorator =
  (..._args: unknown[]): Decorator =>
  () =>
    undefined;

export const ApiExtraModels = noopDecorator;
export const ApiBasicAuth = noopDecorator;
export const ApiBearerAuth = noopDecorator;
export const ApiBody = noopDecorator;
export const ApiCallbacks = noopDecorator;
export const ApiConsumes = noopDecorator;
export const ApiCookieAuth = noopDecorator;
export const ApiExcludeController = noopDecorator;
export const ApiExcludeEndpoint = noopDecorator;
export const ApiExtension = noopDecorator;
export const ApiHeader = noopDecorator;
export const ApiHideProperty = noopDecorator;
export const ApiLink = noopDecorator;
export const ApiOAuth2 = noopDecorator;
export const ApiOperation = noopDecorator;
export const ApiParam = noopDecorator;
export const ApiProperty = noopDecorator;
export const ApiPropertyOptional = noopDecorator;
export const ApiProduces = noopDecorator;
export const ApiQuery = noopDecorator;
export const ApiResponse = noopDecorator;
export const ApiResponseProperty = noopDecorator;
export const ApiSecurity = noopDecorator;
export const ApiTags = noopDecorator;

export function getSchemaPath(model: { name?: string } | (new (...args: never[]) => unknown)): string {
  return `#/components/schemas/${model.name ?? 'Unknown'}`;
}

export class DocumentBuilder {
  setTitle(_title: string): this {
    return this;
  }

  setDescription(_description: string): this {
    return this;
  }

  setVersion(_version: string): this {
    return this;
  }

  addCookieAuth(_name: string): this {
    return this;
  }

  build(): Record<string, unknown> {
    return {};
  }
}

export const SwaggerModule = {
  createDocument: () => ({ openapi: '3.0.0', info: {}, paths: {} }),
  setup: (..._args: unknown[]) => undefined,
};
