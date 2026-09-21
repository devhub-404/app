import { escapeHtml, type EmailTemplate } from './email-template';
type ContactMessageType = 'institutional' | 'legal' | 'support';

type ContactMessageTemplateInput = {
  type: ContactMessageType;
  name?: string;
  email: string;
  subject: string;
  message: string;
  contextUrl?: string;
};

export const contactMessageTemplate: EmailTemplate<ContactMessageTemplateInput> = (input) => {
  const contact =
    input.name || input.email ? `${input.name ?? 'Sem nome'}${input.email ? ` <${input.email}>` : ''}` : 'Anônimo';
  const context = input.contextUrl ?? 'Não informado';

  return {
    subject: `[DevHub Contact · ${input.type}] ${input.subject}`,
    html: `<div style="font-family:Arial,sans-serif;color:#333;max-width:640px;margin:auto"><h2>Nova mensagem de contato</h2><p><strong>Tipo:</strong> ${escapeHtml(input.type)}</p><p><strong>Contato:</strong> ${escapeHtml(contact)}</p><p><strong>Assunto:</strong> ${escapeHtml(input.subject)}</p><p><strong>Contexto:</strong> ${escapeHtml(context)}</p><hr><p style="white-space:pre-wrap">${escapeHtml(input.message)}</p></div>`,
    text: `Nova mensagem de contato\n\nTipo: ${input.type}\nContato: ${contact}\nAssunto: ${input.subject}\nContexto: ${context}\n\n${input.message}`,
  };
};
