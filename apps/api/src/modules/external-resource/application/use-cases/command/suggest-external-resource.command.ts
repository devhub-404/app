import { Injectable } from '@nestjs/common';
import { SuggestExternalResourceDTO } from '@/modules/external-resource/application/dtos/in';
import { ExternalResourceSuggestionDTO } from '@/modules/external-resource/application/dtos/out';
import { ExternalResourceSuggestionRepository } from '@/modules/external-resource/application/ports/repositories/external-resource-suggestion.repository';
import { ExternalResourceSuggestion } from '@/modules/external-resource/domain/external-resource-suggestion';
import { ModerationAccountRestrictionPort } from '@/modules/moderation/public';

@Injectable()
export class SuggestExternalResourceCommand {
  constructor(
    private readonly repository: ExternalResourceSuggestionRepository,
    private readonly accountRestrictionService: ModerationAccountRestrictionPort,
  ) {}

  async execute(userId: string, payload: SuggestExternalResourceDTO): Promise<ExternalResourceSuggestionDTO> {
    await this.accountRestrictionService.assertAccountCapability(userId, 'CONTRIBUTION');
    const suggestion = ExternalResourceSuggestion.create('__new__', {
      submittedByAccountId: userId,
      url: payload.url,
    });
    const id = await this.repository.create(suggestion);

    return {
      id,
      acceptedExternalResourceId: null,
      submittedByAccountId: userId,
      url: suggestion.url,
      status: suggestion.status,
      decisionNote: null,
      decidedByAccountId: null,
      decidedAt: null,
      createdAt: suggestion.createdAt,
    };
  }
}
