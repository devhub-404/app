import { renderLinkEmail, type EmailTemplate } from './email-template';

export const accountRecoveryTemplate: EmailTemplate<{ url: string }> = ({ url }) => ({
  subject: 'Recuperação de conta',
  ...renderLinkEmail({
    title: 'Recuperação de conta',
    description: 'Use o link abaixo para concluir a recuperação da sua conta:',
    action: 'Recuperar conta',
    url,
    expiration: 'Este link expira em 15 minutos.',
  }),
});
