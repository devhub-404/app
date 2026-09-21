import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { ExternalResourceSuggestionRepository } from '@/modules/external-resource/application/ports/repositories/external-resource-suggestion.repository';
import { ExternalResourcePolicy } from '@/modules/external-resource/application/resource.policy';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { ExternalResourceSuggestionStatus } from '@/modules/external-resource/domain/external-resource-suggestion';
@Injectable()
export class RejectExternalResourceSuggestionCommand {
  constructor(
    private readonly suggestions: ExternalResourceSuggestionRepository,
    private readonly policy: ExternalResourcePolicy,
  ) {}
  async execute(user: User, id: string, note?: string): Promise<void> {
    this.policy.canReview(user);
    const suggestion = await this.suggestions.findById(id);
    if (!suggestion) throw new AppError('EXTERNAL_RESOURCE_SUGGESTION_NOT_FOUND');
    suggestion.reject(user.sub, note);
    if (!(await this.suggestions.save(suggestion, ExternalResourceSuggestionStatus.Pending)))
      throw new AppError('EXTERNAL_RESOURCE_SUGGESTION_INVALID_STATUS');
  }
}
