export type EmailTemplate<T> = (input: T) => {
  subject: string;
  html: string;
  text: string;
};

export function escapeHtml(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderLinkEmail(input: {
  title: string;
  description: string;
  action: string;
  url: string;
  expiration: string;
}): { html: string; text: string } {
  const url = escapeHtml(input.url);

  return {
    html: `<div style="font-family:Arial,sans-serif;color:#333;text-align:center;max-width:600px;margin:auto"><h2>${escapeHtml(input.title)}</h2><p>${escapeHtml(input.description)}</p><p><a href="${url}" style="display:inline-block;padding:10px 20px;background:#0073e6;color:#fff;text-decoration:none;border-radius:5px">${escapeHtml(input.action)}</a></p><p>${escapeHtml(input.expiration)}</p></div>`,
    text: `${input.title}\n\n${input.description}\n\n${input.action}: ${input.url}\n\n${input.expiration}`,
  };
}
