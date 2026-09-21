import { Injectable } from '@nestjs/common';
import { DiscoveryReadPort } from '@/modules/discovery/application/ports';
import { GetRelatedContentInputDTO } from '@/modules/discovery/application/dtos/in';
import { GetRelatedContentOutputDTO } from '@/modules/discovery/application/dtos/out';

@Injectable()
export class GetRelatedContentQuery {
  constructor(private readonly discovery: DiscoveryReadPort) {}

  execute(input: GetRelatedContentInputDTO): Promise<GetRelatedContentOutputDTO> {
    return this.discovery.related(input.resourceId, input.limit);
  }
}
