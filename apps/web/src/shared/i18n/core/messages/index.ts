import { messages as pt } from './pt';
import { messages as en } from './en';
import { messages as es } from './es';

export const messages = {
  pt,
  en,
  es,
} as const;

export type Lang = keyof typeof messages;
export type MessageCode = keyof typeof messages.pt;
