import { applyDecorators, type Type } from '@nestjs/common';
import { ResponseMeta } from './response-meta.decorator';
import { ApiAppResponse, type ApiAppResponseOptions } from './api-response';

export function AppResponse<TModel extends Type<unknown>>(
  code: string,
  model?: TModel,
  options: ApiAppResponseOptions = {},
) {
  return applyDecorators(ResponseMeta(code), ApiAppResponse(model, { ...options, code }));
}
