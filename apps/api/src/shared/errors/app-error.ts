import { BaseError } from '@/shared/errors/base-error';

export class AppError extends BaseError {
  constructor(
    code: string,
    public readonly data?: Record<string, unknown>,
  ) {
    super(String(code));
  }
}
