import { Injectable } from '@nestjs/common';
import { DiscoveryReadPort } from '@/modules/discovery/application/ports';
import { SearchExploreInputDTO } from '@/modules/discovery/application/dtos/in';
import { SearchExploreOutputDTO } from '@/modules/discovery/application/dtos/out';

@Injectable()
export class SearchExploreQuery {
  constructor(private readonly discovery: DiscoveryReadPort) {}

  execute(input: SearchExploreInputDTO): Promise<SearchExploreOutputDTO> {
    return this.discovery.list(input);
  }
}
