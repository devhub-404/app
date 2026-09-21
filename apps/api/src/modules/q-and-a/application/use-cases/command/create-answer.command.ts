import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { ModerationAccountRestrictionPort } from '@/modules/moderation/public';
import { NotificationPublicService } from '@/modules/notification/public';
import { QAndARepository } from '@/modules/q-and-a/application/ports/repositories';
import type { CreateAnswerDTO } from '../../dtos';
import { ResourceIdentityPort } from '@/shared/kernel/resource/resource-identity.port';
@Injectable()
export class CreateAnswerCommand {
  constructor(
    private readonly repository: QAndARepository,
    private readonly notifications: NotificationPublicService,
    private readonly restrictions: ModerationAccountRestrictionPort,
    private readonly resources: ResourceIdentityPort,
  ) {}
  async execute(authorId: string, questionId: string, input: CreateAnswerDTO) {
    await this.restrictions.assertAccountCapability(authorId, 'CONTRIBUTION');
    const question = await this.repository.getQuestion(questionId);
    if (!question) throw new AppError('CONTENT_NOT_FOUND');
    try {
      const answer = await this.repository.transaction(async (context) => {
        const identity = await this.resources.create('answer', context);

        return this.repository.createAnswer(identity.id, questionId, authorId, input.content, context);
      });
      if (question.authorAccountId && question.authorAccountId !== authorId)
        await this.notifications.notify({
          accountId: question.authorAccountId,
          type: 'question_answered',
          sourceType: 'answer',
          sourceId: answer.id,
          targetType: 'question',
          targetId: questionId,
        });

      return answer;
    } catch (error) {
      if (String(error).includes('CLOSED')) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');

      throw new AppError('CONTENT_NOT_FOUND');
    }
  }
}
