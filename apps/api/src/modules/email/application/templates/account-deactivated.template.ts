import type { EmailTemplate } from './email-template';

export const accountDeactivatedTemplate: EmailTemplate<Record<string, never>> = () => ({
  subject: 'Conta desativada',
  html: '<div style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:auto"><h2>Conta desativada</h2><p>Sua conta DevHub foi desativada. O acesso permanecerá interrompido até que você a reative.</p></div>',
  text: 'Conta desativada\n\nSua conta DevHub foi desativada. O acesso permanecerá interrompido até que você a reative.',
});
