import { describe, expect, it, vi } from 'vitest';
import { SendEmailCommand } from '@/modules/email/application/use-cases/command/send-email.command';

// Normative source: docs/domains/email/SPEC.md.
describe('Email use-case contract', () => {
  it('EMAIL-RN-001/EMAIL-RF-001 — preserves caller-owned recipient and message semantics and delegates one outbound attempt', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const command = new SendEmailCommand({ send });
    const message = {
      to: 'recipient@example.com',
      from: 'DevHub 404',
      subject: 'Subject chosen by caller',
      html: '<p>Rendered message</p>',
    };

    await expect(command.execute(message)).resolves.toBeUndefined();
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(message);
  });

  it('EMAIL-RF-001 — propagates outbound rejection instead of reporting a false successful delivery', async () => {
    const failure = new Error('provider unavailable');
    const command = new SendEmailCommand({ send: vi.fn().mockRejectedValue(failure) });

    await expect(
      command.execute({ to: 'recipient@example.com', from: 'DevHub 404', subject: 'Subject', html: '<p>Body</p>' }),
    ).rejects.toBe(failure);
  });
});
