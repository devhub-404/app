import type { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Subscript } from '@/shared/ui/editor/extensions/subscript';
import { Superscript } from '@/shared/ui/editor/extensions/superscript';
import { TextAlign } from '@/shared/ui/editor/extensions/textAlign';
import { TextStyle } from '@/shared/ui/editor/extensions/textStyle';
import { FontSize } from '@/shared/ui/editor/extensions/fontSize';

type ExtensionOptions = {
  placeholder?: string;
};

export function buildTiptapExtensions(options: ExtensionOptions = {}): Extension[] {
  return [
    StarterKit.configure({
      codeBlock: false,
      link: false,
      underline: false,
    }),
    Link.configure({
      // Allow opening links when not editing, keep editing clicks safe.
      openOnClick: 'whenNotEditable',
      linkOnPaste: true,
      autolink: true,
      defaultProtocol: 'https',
      HTMLAttributes: {
        rel: 'noopener noreferrer nofollow',
      },
    }),
    Image.configure({
      allowBase64: true,
      inline: true,
      HTMLAttributes: {
        class: 'aspect-auto',
      },
    }),
    Highlight,
    Underline,
    Subscript,
    Superscript,
    TextStyle,
    FontSize,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'right', 'center', 'justify'],
    }),
    Placeholder.configure({
      placeholder: options.placeholder ?? '',
    }),
    CharacterCount,
  ] as Extension[];
}
