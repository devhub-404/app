import { Injectable } from '@nestjs/common';
import { ModerationAccountRestrictionPort } from '@/modules/moderation/public';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public';
import { QAndARepository } from '@/modules/q-and-a/application/ports/repositories';
import { ResourceIdentityPort } from '@/shared/kernel/resource/resource-identity.port';
import type { CreateQuestionDTO, QuestionDTO } from '../../dtos';

@Injectable()
export class CreateQuestionCommand {
  constructor(
    private readonly repository: QAndARepository,
    private readonly taxonomy: TaxonomyPublicServicePort,
    private readonly restrictions: ModerationAccountRestrictionPort,
    private readonly resources: ResourceIdentityPort,
  ) {}

  async execute(authorId: string, input: CreateQuestionDTO): Promise<QuestionDTO> {
    await this.restrictions.assertAccountCapability(authorId, 'CONTRIBUTION');
    const classification = await this.taxonomy.validateTags(input.tagSlugs, authorId);

    return this.repository.transaction(async (context) => {
      const identity = await this.resources.create('question', context);
      const question = await this.repository.createQuestion(identity.id, authorId, input.title, input.content, context);
      await this.taxonomy.setResourceClassification(question.id, classification, context);

      return { ...question, tagSlugs: input.tagSlugs };
    });
  }
}
