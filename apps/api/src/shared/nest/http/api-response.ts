import { applyDecorators, HttpStatus, type Type } from '@nestjs/common';
import { ApiExtraModels, ApiProperty, ApiResponse, getSchemaPath } from '@nestjs/swagger';

export class ApiResponseDTO {
  @ApiProperty()
  code!: string;

  @ApiProperty()
  message!: string;

  @ApiProperty({ nullable: true })
  data!: unknown;
}

export type ApiAppResponseOptions = {
  status?: number;
  isArray?: boolean;
  nullable?: boolean;
  code?: string;
  paginated?: boolean;
};

export function ApiAppResponse<TModel extends Type<unknown>>(
  model: TModel | undefined,
  options: ApiAppResponseOptions = { status: HttpStatus.OK, isArray: false, nullable: false, paginated: false },
) {
  const normalized = {
    status: options.status ?? HttpStatus.OK,
    isArray: options.isArray ?? false,
    nullable: options.nullable ?? false,
    paginated: options.paginated ?? false,
    code: options.code,
  };

  if (normalized.paginated && !model) {
    throw new Error("ApiAppResponse: 'model' is required when paginated is true.");
  }

  let dataSchema: Record<string, unknown>;
  if (normalized.paginated) {
    dataSchema = {
      type: 'object',
      properties: {
        items: { type: 'array', items: { $ref: getSchemaPath(model!) } },
        page: { type: 'number' },
        pageSize: { type: 'number' },
        total: { type: 'number' },
      },
      required: ['items', 'page', 'pageSize', 'total'],
    };
  } else if (model) {
    dataSchema = normalized.isArray
      ? { type: 'array', items: { $ref: getSchemaPath(model) }, nullable: normalized.nullable }
      : { $ref: getSchemaPath(model), nullable: normalized.nullable };
  } else {
    dataSchema = { nullable: true };
  }

  const decorators = [
    ApiResponse({
      status: normalized.status,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDTO) },
          { properties: { ...(normalized.code ? { code: { enum: [normalized.code] } } : {}), data: dataSchema } },
        ],
      },
    }),
  ];

  decorators.unshift(model ? ApiExtraModels(ApiResponseDTO, model) : ApiExtraModels(ApiResponseDTO));

  return applyDecorators(...decorators);
}
