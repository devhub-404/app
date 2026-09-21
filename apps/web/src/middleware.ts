import { sequence } from 'astro:middleware';
import { accessMiddleware } from '@/app/access/access.middleware';
import { bootstrapMiddleware } from '@/app/request/bootstrap.middleware';
import { responseMiddleware } from '@/app/request/response.middleware';

export const onRequest = sequence(responseMiddleware, bootstrapMiddleware, accessMiddleware);
