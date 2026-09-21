import { Editor, type JSONContent } from '@tiptap/core';
import { generateHTML, generateJSON } from '@tiptap/html';
import { Markdown } from '@tiptap/markdown';
import { buildTiptapExtensions } from '@/shared/ui/editor/tiptap';
import DiffMatchPatch from 'diff-match-patch';

const patcher = new DiffMatchPatch();

export function createMarkdownPatch(baseContent: string, editedContent: string): string {
  return patcher.patch_toText(patcher.patch_make(baseContent, editedContent));
}

export function applyMarkdownPatch(content: string, patchText: string): string {
  const patches = patcher.patch_fromText(patchText);
  const [nextContent, results] = patcher.patch_apply(patches, content);
  if (results.some((applied: boolean) => !applied)) return content;
  return nextContent;
}

export function parseContentToJson(value: string | null | undefined, placeholder = ''): JSONContent | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as JSONContent;
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {}
  try {
    return generateJSON(value, buildTiptapExtensions({ placeholder }));
  } catch {
    return null;
  }
}

export function serializeContent(value: JSONContent | null | undefined): string {
  return value ? JSON.stringify(value) : '';
}

export function renderContentToHtml(value: string | JSONContent | null | undefined, placeholder = ''): string {
  if (!value) return '';
  if (typeof value !== 'string') return generateHTML(value, buildTiptapExtensions({ placeholder }));
  try {
    const parsed = JSON.parse(value) as JSONContent;
    return generateHTML(parsed, buildTiptapExtensions({ placeholder }));
  } catch {}

  // The markdown editor relies on browser globals while parsing. Detail pages
  // are also rendered by Astro on the server, so never instantiate the editor
  // during SSR. The client keeps the richer Markdown extension below.
  if (typeof window === 'undefined') {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
      .replace(/\r?\n/g, '<br />');
  }

  const extensions = [...buildTiptapExtensions({ placeholder }), Markdown];
  const editor = new Editor({
    extensions,
    content: value,
    contentType: /^\s*</.test(value) ? 'html' : 'markdown',
  });
  try {
    return editor.getHTML();
  } finally {
    editor.destroy();
  }
}
