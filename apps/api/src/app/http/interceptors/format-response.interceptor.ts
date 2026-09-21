import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable, tap } from 'rxjs';
import type { FastifyReply } from 'fastify';
import { ResponseMeta } from '@/shared/nest/http/response-meta.decorator';
import { getResponseByCode } from '@/app/http/app-responses';

@Injectable()
export default class FormatResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const res = context.switchToHttp().getResponse<FastifyReply>();
    const code = this.reflector.get(ResponseMeta, context.getHandler());
    if (!code) {
      return next.handle();
    }
    const { code: safeCode, status, message } = getResponseByCode(code);

    return next.handle().pipe(
      tap(() => {
        res.status(status);
      }),
      map((response: unknown) => {
        const metadata = { code: safeCode, message };

        if (response) {
          return { data: response, ...metadata };
        }

        return { ...metadata, data: null };
      }),
    );
  }
}
