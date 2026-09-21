import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    superscript: {
      toggleSuperscript: () => ReturnType;
    };
  }
}

export const Superscript = Mark.create({
  name: 'superscript',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [{ tag: 'sup' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['sup', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      toggleSuperscript:
        () =>
        ({ chain }) => {
          // Prevent subscript and superscript at the same time.
          return chain().unsetMark('subscript').toggleMark(this.name).run();
        },
    };
  },
});
