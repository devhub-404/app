import { Injectable } from '@nestjs/common';
import { DiscoveryReadPort } from '@/modules/discovery/application/ports';
import { ListTrendingContentInputDTO } from '@/modules/discovery/application/dtos/in';
import { ListTrendingContentOutputDTO } from '@/modules/discovery/application/dtos/out';

@Injectable()
export class ListTrendingContentQuery {
  constructor(private readonly discovery: DiscoveryReadPort) {}

  execute(input: ListTrendingContentInputDTO): Promise<ListTrendingContentOutputDTO> {
    return this.discovery.list(input, 'trending');
  }
}
