import type { ToolDefinition } from '../domain/tool-catalog.domain.ts';

export type ToolMode = 'encode' | 'decode';

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeBase64(value: string): string {
  const binary = atob(value);
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

export function executeTool(tool: ToolDefinition, input: string, mode: ToolMode = 'encode'): string {
  if (tool.kind === 'json') return JSON.stringify(JSON.parse(input), null, 2);
  return mode === 'encode' ? encodeBase64(input) : decodeBase64(input);
}
