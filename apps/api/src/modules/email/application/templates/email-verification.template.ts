import { renderLinkEmail, type EmailTemplate } from './email-template';

export const emailVerificationTemplate: EmailTemplate<{ url: string }> = ({ url }) => ({
  subject: 'Confirme seu email',
  ...renderLinkEmail({
    title: 'Confirmação de email',
    description: 'Clique no link abaixo para confirmar seu endereço de email:',
    action: 'Confirmar email',
    url,
    expiration: 'Este link expira em 24 horas. Se você não solicitou, ignore este email.',
  }),
});
