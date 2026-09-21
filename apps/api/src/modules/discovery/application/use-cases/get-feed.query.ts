import { Injectable } from '@nestjs/common';
import { DiscoveryReadPort } from '@/modules/discovery/application/ports';
import { GetFeedInputDTO } from '@/modules/discovery/application/dtos/in';
import { GetFeedOutputDTO } from '@/modules/discovery/application/dtos/out';

@Injectable()
export class GetFeedQuery {
  constructor(private readonly discovery: DiscoveryReadPort) {}

  execute(input: GetFeedInputDTO, accountId?: string | null): Promise<GetFeedOutputDTO> {
    return this.discovery.feed(input, accountId);
  }
}
