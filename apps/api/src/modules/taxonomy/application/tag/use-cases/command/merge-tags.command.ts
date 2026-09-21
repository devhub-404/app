import { Injectable } from '@nestjs/common';
import { MergeTagsDTO } from '@/modules/taxonomy/application/tag/dtos/in';
import { TagWorkflowRepository } from '@/modules/taxonomy/application/tag/ports/tag-workflow.repository';

@Injectable()
export class MergeTagsCommand {
  constructor(private readonly workflow: TagWorkflowRepository) {}
  async execute(userId: string, payload: MergeTagsDTO): Promise<void> {
    await this.workflow.createMerge({ ...payload, mergedById: userId });
  }
}
