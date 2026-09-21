import { describe, expect, it } from 'vitest';
import { validate } from 'class-validator';
import { SubmitFeedbackDTO } from '@/modules/feedback/application/dtos';
import { SubmitFeedbackCommand } from '@/modules/feedback/application/use-cases/command/submit-feedback.command';
import { UpdateFeedbackStatusCommand } from '@/modules/feedback/application/use-cases/command/update-feedback-status.command';

describe('Feedback', () => {
  it('accepts only the three public categories and a meaningful description', async () => {
    const valid = Object.assign(new SubmitFeedbackDTO(), {
      category: 'issue',
      description: 'Algo está quebrado nesta tela.',
    });
    expect(await validate(valid)).toHaveLength(0);
    const invalid = Object.assign(new SubmitFeedbackDTO(), { category: 'abuse', description: 'curto' });
    expect(await validate(invalid)).not.toHaveLength(0);
  });

  it('confirms submission only after the repository accepts it', async () => {
    const command = new SubmitFeedbackCommand({
      create: async () => ({ id: 'feedback-1', status: 'open', createdAt: new Date() }),
    } as never);
    await expect(
      command.execute('account-1', { category: 'bug', description: 'Falha reproduzível no fluxo de login.' }),
    ).resolves.toMatchObject({ accepted: true, id: 'feedback-1' });
  });

  it('rejects a status transition the repository cannot apply', async () => {
    const command = new UpdateFeedbackStatusCommand({ findById: async () => null } as never);
    await expect(command.execute('feedback-1', 'resolved')).rejects.toMatchObject({
      message: 'FEEDBACK_INVALID_STATUS',
    });
  });
});
