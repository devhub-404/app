import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

// Syntax highlighting is only needed by the editor, not by the page shell or
// by read-only Markdown rendering. Keep this dependency outside the base
// extension graph.
const lowlight = createLowlight(common);

export function buildTiptapCodeBlockExtension() {
  return CodeBlockLowlight.configure({ lowlight });
}
