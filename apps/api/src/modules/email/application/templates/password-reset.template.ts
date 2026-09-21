import { renderLinkEmail, type EmailTemplate } from './email-template';

export const passwordResetTemplate: EmailTemplate<{ url: string }> = ({ url }) => ({
  subject: 'Redefinição de senha',
  ...renderLinkEmail({
    title: 'Redefinição de senha',
    description: 'Recebemos uma solicitação para redefinir sua senha. Clique no link abaixo:',
    action: 'Redefinir senha',
    url,
    expiration: 'Este link expira em 15 minutos. Se você não solicitou, ignore este email.',
  }),
});
