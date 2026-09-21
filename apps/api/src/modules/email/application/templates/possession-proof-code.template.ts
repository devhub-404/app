import { escapeHtml, type EmailTemplate } from './email-template';

export const possessionProofCodeTemplate: EmailTemplate<{ code: string }> = ({ code }) => ({
  subject: 'Código de prova de posse',
  html: `<div style="font-family:Arial,sans-serif;color:#333;text-align:center;max-width:600px;margin:auto"><h2>Prova de posse</h2><p>Use o código abaixo para autorizar a ação sensível solicitada na sua conta:</p><div style="display:inline-block;padding:12px 16px;background:#f4f4f4;border-radius:6px;font-size:20px;letter-spacing:.08em">${escapeHtml(code)}</div><p>Este código expira em 10 minutos. Se você não solicitou, ignore este email.</p></div>`,
  text: `Prova de posse\n\nUse o código abaixo para autorizar a ação sensível solicitada na sua conta:\n\n${code}\n\nEste código expira em 10 minutos. Se você não solicitou, ignore este email.`,
});
