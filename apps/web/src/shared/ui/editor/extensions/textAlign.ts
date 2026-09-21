import { Extension } from '@tiptap/core';

export type TextAlignValue = 'left' | 'center' | 'right' | 'justify';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textAlign: {
      setTextAlign: (alignment: TextAlignValue) => ReturnType;
      unsetTextAlign: () => ReturnType;
    };
  }
}

type Options = {
  types: string[];
  alignments: TextAlignValue[];
};

/**
 * Minimal replacement for `@tiptap/extension-text-align`.
 * Adds a `textAlign` attribute to the configured block node types and commands
 * to set/unset it.
 */
export const TextAlign = Extension.create<Options>({
  name: 'textAlign',

  addOptions() {
    return {
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: null,
            parseHTML: (element) => {
              const align = element.style.textAlign as TextAlignValue | '';
              return this.options.alignments.includes(align as TextAlignValue) ? align : null;
            },
            renderHTML: (attributes) => {
              const align = attributes['textAlign'] as TextAlignValue | null | undefined;
              if (!align) return {};
              if (!this.options.alignments.includes(align)) return {};
              return { style: `text-align: ${align}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextAlign:
        (alignment) =>
        ({ commands }) => {
          const updates = this.options.types.map((type) => commands.updateAttributes(type, { textAlign: alignment }));
          return updates.every(Boolean);
        },
      unsetTextAlign:
        () =>
        ({ commands }) => {
          const updates = this.options.types.map((type) => commands.resetAttributes(type, 'textAlign'));
          return updates.every(Boolean);
        },
    };
  },
});
