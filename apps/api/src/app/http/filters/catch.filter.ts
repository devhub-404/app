import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { BaseError } from '@/shared/errors/base-error';
import { getResponseByCode } from '@/app/http/app-responses';

@Catch()
export default class CatchFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    if (exception instanceof BaseError) {
      const { code, status, message } = getResponseByCode(exception.code);
      const data = (exception as { data?: Record<string, unknown> }).data;

      response.code(status).send({
        code,
        message,
        ...(data ? { data } : {}),
      });

      return;
    }

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';

    switch (Number(status)) {
      case Number(HttpStatus.NOT_FOUND):
        code = 'NOT_FOUND';
        break;
      case Number(HttpStatus.BAD_REQUEST):
        code = 'INVALID_INPUT';
        break;
      case Number(HttpStatus.UNAUTHORIZED):
        code = 'UNAUTHORIZED';
        break;
      case Number(HttpStatus.FORBIDDEN):
        code = 'FORBIDDEN';
        break;
      case Number(HttpStatus.CONFLICT):
        code = 'CONFLICT';
        break;
    }
    const metadata = getResponseByCode(code);

    response.code(status).send({
      code: metadata.code,
      message: metadata.message,
    });
  }
}
