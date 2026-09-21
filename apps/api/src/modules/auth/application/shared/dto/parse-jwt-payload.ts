import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function parseJwtPayload<T extends object>(Dto: new () => T, payload: unknown): T {
  if (!isRecord(payload)) {
    throw new Error('Invalid token payload');
  }

  const instance = plainToInstance(Dto, payload);
  const errors = validateSync(instance as object, {
    forbidUnknownValues: true,
  });

  if (errors.length > 0) {
    throw new Error('Invalid token payload');
  }

  return instance;
}
