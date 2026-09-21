import ToggleButton from '@/shared/ui/components/actions/toggle-button.component.tsx';
import Select from '@/shared/ui/components/forms/select.component.tsx';
import { Editor } from '@tiptap/core';
import { createEffect, createSignal, For, onCleanup, onMount, Show } from 'solid-js';
import { buildTiptapExtensions } from '@/shared/ui/editor/tiptap';

import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/shared/i18n';
export type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  ariaLabel?: string;
  readOnly?: boolean;
};
type IconName =
  'heading' | 'bold' | 'italic' | 'underline' | 'quote' | 'list' | 'ordered' | 'code' | 'image' | 'link' | 'table';
type BlockStyle = 'paragraph' | 'h1' | 'h2' | 'h3';

function ToolbarIcon(props: { name: IconName; class?: string }) {
  const paths: Record<IconName, string> = {
    heading: 'M4 5v14M20 5v14M4 12h16M4 5h4M16 5h4M4 19h4M16 19h4',
    bold: 'M7 5h6a4 4 0 0 1 0 8H7zm0 8h7a4 4 0 0 1 0 8H7z',
    italic: 'M10 5h8M6 19h8M14 5 10 19',
    underline: 'M6 5v6a6 6 0 0 0 12 0V5M5 19h14',
    quote:
      'M6 9H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v-6a2 2 0 0 0-2-2Zm14 0h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v-6a2 2 0 0 0-2-2Z',
    list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    ordered: 'M4 5h1v4M4 9h2M4 12h2l-2 3h2M4 18h2M9 6h12M9 12h12M9 18h12',
    code: 'm8 9-4 3 4 3m8-6 4 3-4 3M14 5l-4 14',
    image: 'M4 5h16v14H4zM4 16l4-4 3 3 3-4 6 6M15 9h.01',
    link: 'M10 13a5 5 0 0 0 7.54.54l1.92-1.92a5 5 0 0 0-7.07-7.07l-1.1 1.1M14 11a5 5 0 0 0-7.54-.54l-1.92 1.92a5 5 0 0 0 7.07 7.07l1.1-1.1',
    table: 'M4 5h16v14H4zM4 10h16M4 15h16M10 5v14M16 5v14',
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class ?? 'size-4'}
      aria-hidden="true"
    >
      <path d={paths[props.name]} />
    </svg>
  );
}

const HeadingIcon = (props: { class?: string }) => <ToolbarIcon name="heading" class={props.class} />;

function MarkdownEditor(props: MarkdownEditorProps) {
  const { t } = useI18n();
  let host!: HTMLDivElement;
  let editor: Editor | undefined;
  let lastExternal = props.value;
  const [editorReady, setEditorReady] = createSignal(false);
  const [editorRevision, setEditorRevision] = createSignal(0);
  onMount(async () => {
    const [{ Markdown }, { buildTiptapCodeBlockExtension }] = await Promise.all([
      import('@tiptap/markdown'),
      import('@/shared/ui/editor/tiptap-code-block'),
    ]);
    if (!host) return;
    editor = new Editor({
      element: host,
      extensions: [
        ...buildTiptapExtensions({ placeholder: props.placeholder }),
        buildTiptapCodeBlockExtension(),
        Markdown,
      ],
      content: props.value,
      contentType: 'markdown',
      editable: !props.readOnly,
      editorProps: {
        attributes: {
          class:
            'content-prose max-w-none px-4 py-4 text-sm text-content focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2',
          role: 'textbox',
          'aria-multiline': 'true',
          'aria-label': props.ariaLabel ?? props.placeholder ?? t('markdowneditor.editor'),
        },
      },
      onUpdate: ({ editor: current }) => {
        const next = current.getMarkdown();
        lastExternal = next;
        props.onChange(next);
      },
    });
    editor.on('selectionUpdate', () => setEditorRevision((revision) => revision + 1));
    editor.on('transaction', () => setEditorRevision((revision) => revision + 1));
    setEditorReady(true);
  });
  createEffect(() => {
    const next = props.value;
    if (!editor || next === lastExternal) return;
    lastExternal = next;
    editor.commands.setContent(next, {
      contentType: 'markdown',
      emitUpdate: false,
    });
  });
  createEffect(() => {
    if (editor) editor.setEditable(!props.readOnly);
  });
  onCleanup(() => {
    editor?.destroy();
  });
  const command = (fn: (current: Editor) => void) => () => {
    if (editor) fn(editor);
  };
  const runTool = (action: () => void) => action();
  const promptFor = (label: string, fallback: string) => window.prompt(label, fallback)?.trim();
  const tools: Array<[IconName, string, () => void]> = [
    ['bold', t('markdowneditor.textBold'), command((e) => e.chain().focus().toggleBold().run())],
    ['italic', t('markdowneditor.textItalic'), command((e) => e.chain().focus().toggleItalic().run())],
    ['underline', t('markdowneditor.textUnderline'), command((e) => e.chain().focus().toggleUnderline().run())],
    ['quote', t('markdowneditor.quote'), command((e) => e.chain().focus().toggleBlockquote().run())],
    ['list', t('markdowneditor.bulletList'), command((e) => e.chain().focus().toggleBulletList().run())],
    ['ordered', t('markdowneditor.numberedList'), command((e) => e.chain().focus().toggleOrderedList().run())],
    ['code', t('markdowneditor.blockCode'), command((e) => e.chain().focus().toggleCodeBlock().run())],
    [
      'image',
      t('markdowneditor.insertImage'),
      command((e) => {
        const src = promptFor(t('markdowneditor.imageUrl'), 'https://');
        if (src) e.chain().focus().setImage({ src, alt: '' }).run();
      }),
    ],
    [
      'link',
      t('markdowneditor.insertLink'),
      command((e) => {
        const href = promptFor(t('markdowneditor.linkUrl'), 'https://');
        if (href) e.chain().focus().setLink({ href }).run();
      }),
    ],
    [
      'table',
      t('markdowneditor.insertTable'),
      command((e) =>
        e
          .chain()
          .focus()
          .insertContent(
            `\n| ${t('markdowneditor.column')} | ${t('markdowneditor.value')} |\n| --- | --- |\n| ${t('markdowneditor.item')} | ${t('markdowneditor.describeHere')} |\n`,
          )
          .run(),
      ),
    ],
  ];
  const blockStyle = () => {
    editorRevision();
    if (!editor) return 'paragraph' as BlockStyle;
    for (const level of ['h1', 'h2', 'h3'] as const) {
      if (editor.isActive('heading', { level: Number(level.slice(1)) })) return level;
    }
    return 'paragraph' as BlockStyle;
  };
  const setBlockStyle = (value: BlockStyle) => {
    if (!editor) return;
    const chain = editor.chain().focus();
    value === 'paragraph'
      ? chain.setParagraph().run()
      : chain.toggleHeading({ level: Number(value.slice(1)) as 1 | 2 | 3 }).run();
  };
  const isActive = (icon: IconName) => {
    editorRevision();
    if (!editor) return false;
    if (icon === 'heading') return editor.isActive('heading', { level: 2 });
    if (icon === 'bold' || icon === 'italic' || icon === 'underline' || icon === 'link')
      return editor.isActive(icon === 'link' ? 'link' : icon);
    if (icon === 'quote') return editor.isActive('blockquote');
    if (icon === 'list') return editor.isActive('bulletList');
    if (icon === 'ordered') return editor.isActive('orderedList');
    if (icon === 'code') return editor.isActive('codeBlock');
    return false;
  };
  const isToggle = (icon: IconName) =>
    ['heading', 'bold', 'italic', 'underline', 'quote', 'list', 'ordered', 'code', 'link'].includes(icon);
  return (
    <div class="overflow-hidden rounded-2xl border border-line bg-surface">
      <div
        class="flex flex-wrap gap-1 border-b border-line p-2"
        role="toolbar"
        aria-label={t('markdowneditor.formattingContent')}
        aria-busy={!editorReady()}
      >
        <Select<BlockStyle>
          id="markdown-editor-block-style"
          value={blockStyle()}
          ariaLabel={t('markdowneditor.titleSection')}
          icon={HeadingIcon}
          disabled={!editorReady() || props.readOnly}
          options={[
            { value: 'paragraph', label: t('markdowneditor.paragraph') },
            { value: 'h1', label: t('markdowneditor.heading1') },
            { value: 'h2', label: t('markdowneditor.heading2') },
            { value: 'h3', label: t('markdowneditor.heading3') },
          ]}
          onChange={setBlockStyle}
          triggerClass="h-9 min-h-9 w-auto min-w-28 rounded-lg border-0 bg-transparent px-2 text-xs font-semibold text-content-muted hover:bg-hover hover:text-content"
        />
        <For each={tools}>
          {([icon, label, action]) => (
            <Show
              when={isToggle(icon)}
              fallback={
                <button
                  type="button"
                  onClick={() => runTool(action)}
                  title={label}
                  aria-label={label}
                  disabled={!editorReady() || props.readOnly} class="action action-ghost"
                 
                >
                  <ToolbarIcon name={icon} />
                </button>
              }
            >
              <ToggleButton
                type="button"
                pressed={isActive(icon)}
                onClick={() => runTool(action)}
                title={label}
                aria-label={label}
                disabled={!editorReady() || props.readOnly}
                size="sm"
                class="border-0 bg-transparent text-content-muted hover:bg-hover hover:text-content"
              >
                <ToolbarIcon name={icon} />
              </ToggleButton>
            </Show>
          )}
        </For>
        <span class="ml-auto self-center px-2 text-[10px] font-semibold uppercase tracking-[.14em] text-content-muted">
          {t('markdowneditor.markdown')}
        </span>
      </div>
      <div ref={host} style={{ 'min-height': `${props.minHeight ?? 260}px` }} />
    </div>
  );
}

export default withLocale(MarkdownEditor);
