import { Injectable } from '@nestjs/common';
import { QAndAPublicServicePort } from '@/modules/q-and-a/public/q-and-a-public.service';

@Injectable()
export class ListMyAnswersQuery {
  constructor(private readonly qAndA: QAndAPublicServicePort) {}
  execute(accountId: string, limit = 20) {
    return this.qAndA.listByAuthor(accountId, limit).then((items) => items.filter((item) => item.type === 'answer'));
  }
}
