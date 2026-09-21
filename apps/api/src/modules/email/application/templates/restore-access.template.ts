import { renderLinkEmail, type EmailTemplate } from './email-template';

export const restoreAccessTemplate: EmailTemplate<{ url: string }> = ({ url }) => ({
  subject: 'Restaurar acesso à conta',
  ...renderLinkEmail({
    title: 'Restaurar acesso',
    description: 'Sua conta foi marcada para exclusão. Use o link abaixo para restaurar o acesso:',
    action: 'Restaurar acesso',
    url,
    expiration: 'Este link expira em 10 minutos.',
  }),
});
