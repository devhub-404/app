import { Injectable } from '@nestjs/common';
import { DiscoveryReadPort } from '@/modules/discovery/application/ports';
import { ListRecentContentInputDTO } from '@/modules/discovery/application/dtos/in';
import { ListRecentContentOutputDTO } from '@/modules/discovery/application/dtos/out';

@Injectable()
export class ListRecentContentQuery {
  constructor(private readonly discovery: DiscoveryReadPort) {}
  execute(input: ListRecentContentInputDTO): Promise<ListRecentContentOutputDTO> {
    return this.discovery.list(input, 'recent');
  }
}
