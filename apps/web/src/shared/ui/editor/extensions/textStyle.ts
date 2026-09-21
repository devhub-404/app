import { Mark, mergeAttributes } from '@tiptap/core';

/**
 * Minimal replacement for `@tiptap/extension-text-style`.
 * This mark is used as a carrier for inline styles like `fontSize`.
 */
export const TextStyle = Mark.create({
  name: 'textStyle',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {};
  },

  parseHTML() {
    return [{ tag: 'span' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});
