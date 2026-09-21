import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class ParseUUIDPipe implements PipeTransform {
  transform(value: string): string {
    if (!UUID_RE.test(value)) {
      throw new BadRequestException('Invalid UUID format');
    }

    return value;
  }
}
