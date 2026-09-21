import { renderLinkEmail, type EmailTemplate } from './email-template';

export const magicLinkTemplate: EmailTemplate<{ url: string }> = ({ url }) => ({
  subject: 'Seu link de acesso',
  ...renderLinkEmail({
    title: 'Login via Magic Link',
    description: 'Clique no link abaixo para acessar sua conta:',
    action: 'Acessar conta',
    url,
    expiration: 'Este link expira em 10 minutos. Se você não solicitou, ignore este email.',
  }),
});
