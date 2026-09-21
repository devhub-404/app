import { HttpStatus } from '@nestjs/common';

export type ResponseMetadata = Record<
  string,
  {
    status: (typeof HttpStatus)[keyof typeof HttpStatus];
    message: string;
  }
>;
