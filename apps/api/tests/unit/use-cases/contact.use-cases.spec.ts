import { describe, expect, it, vi } from 'vitest';
import { validate } from 'class-validator';
import { SubmitContactMessageCommand } from '@/modules/contact/application/use-cases/submit-contact-message.command';
import { SubmitContactMessageInputDTO } from '@/modules/contact/application/dtos/in';
import { contactConfig } from '../helpers/module-config';

describe('SubmitContactMessageCommand', () => {
  it('only confirms the message after Email Delivery accepts it and escapes user-controlled HTML', async () => {
    const sent: Array<{ subject: string; html: string }> = [];
    const command = new SubmitContactMessageCommand(
      {
        send: async (message) => {
          sent.push(message);
        },
      },
      contactConfig,
    );

    await expect(
      command.execute({
        type: 'support',
        name: '<script>alert(1)</script>',
        subject: 'Falha no catálogo',
        message: '<img src=x onerror=alert(1)>',
        email: 'supporter@example.com',
      }),
    ).resolves.toEqual({ accepted: true });

    expect(sent).toHaveLength(1);
    expect(sent[0].html).not.toContain('<script>');
    expect(sent[0].html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('does not confirm the message when Email Delivery rejects it', async () => {
    const command = new SubmitContactMessageCommand(
      {
        send: async () => {
          throw new Error('provider unavailable');
        },
      },
      contactConfig,
    );

    await expect(
      command.execute({
        type: 'institutional',
        subject: 'Melhoria no filtro',
        message: 'Permitir combinar mais critérios de busca.',
        email: 'institutional@example.com',
      }),
    ).rejects.toThrow('provider unavailable');
  });

  it('sends the rendered message to the configured operational recipient and normalizes same-origin context', async () => {
    const send = vi.fn(async () => undefined);
    const command = new SubmitContactMessageCommand({ send }, contactConfig);

    await expect(
      command.execute({
        type: 'legal',
        email: 'Person@Example.com',
        subject: 'Solicitação formal',
        message: 'Mensagem institucional para análise.',
        contextUrl: 'https://devhub-404.example/contact?source=footer',
      }),
    ).resolves.toEqual({ accepted: true });

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'contact@devhub-404.example',
        html: expect.stringContaining('https://devhub-404.example/contact?source=footer'),
      }),
    );
  });
});

describe('Contact normative input contract', () => {
  // CONTACT-RN-001/002 and CONTACT-RF-001.
  it('accepts only institutional/legal/support communication and always requires a valid reply email', async () => {
    for (const type of ['institutional', 'legal', 'support'] as const) {
      const valid = Object.assign(new SubmitContactMessageInputDTO(), {
        type,
        email: 'person@example.com',
        subject: 'Contato formal',
        message: 'Uma mensagem suficientemente longa.',
      });
      expect(await validate(valid)).toHaveLength(0);
    }

    const missingEmail = Object.assign(new SubmitContactMessageInputDTO(), {
      type: 'support',
      subject: 'Preciso de retorno',
      message: 'Uma mensagem suficientemente longa.',
    });
    expect((await validate(missingEmail)).some((error) => error.property === 'email')).toBe(true);

    for (const type of ['suggestion', 'bug', 'problem']) {
      const feedbackConcern = Object.assign(new SubmitContactMessageInputDTO(), {
        type,
        email: 'person@example.com',
        subject: 'Não pertence a Contact',
        message: 'Este assunto deve usar o fluxo autenticado de Feedback.',
      });
      expect((await validate(feedbackConcern)).some((error) => error.property === 'type')).toBe(true);
    }
  });

  // CONTACT-RN-003: contextUrl is informational and cannot become an arbitrary redirect/origin.
  it('rejects a contextUrl outside the configured DevHub origin before delivery', async () => {
    const send = vi.fn(async () => undefined);
    const command = new SubmitContactMessageCommand({ send }, contactConfig);

    await expect(
      command.execute({
        type: 'support',
        email: 'person@example.com',
        subject: 'Contexto externo',
        message: 'Uma mensagem suficientemente longa.',
        contextUrl: 'https://example.invalid/phishing',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_URL' });
    expect(send).not.toHaveBeenCalled();
  });
});
