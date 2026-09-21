import { Reflector } from '@nestjs/core';

export const ResponseMeta = Reflector.createDecorator<string>();
