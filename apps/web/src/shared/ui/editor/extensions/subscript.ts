import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    subscript: {
      toggleSubscript: () => ReturnType;
    };
  }
}

export const Subscript = Mark.create({
  name: 'subscript',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [{ tag: 'sub' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['sub', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      toggleSubscript:
        () =>
        ({ chain }) => {
          // Prevent subscript and superscript at the same time.
          return chain().unsetMark('superscript').toggleMark(this.name).run();
        },
    };
  },
});
