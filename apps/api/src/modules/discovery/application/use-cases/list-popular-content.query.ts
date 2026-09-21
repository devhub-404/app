import { Injectable } from '@nestjs/common';
import { DiscoveryReadPort } from '@/modules/discovery/application/ports';
import { ListPopularContentInputDTO } from '@/modules/discovery/application/dtos/in';
import { ListPopularContentOutputDTO } from '@/modules/discovery/application/dtos/out';

@Injectable()
export class ListPopularContentQuery {
  constructor(private readonly discovery: DiscoveryReadPort) {}
  execute(input: ListPopularContentInputDTO): Promise<ListPopularContentOutputDTO> {
    return this.discovery.list(input, 'popular');
  }
}
