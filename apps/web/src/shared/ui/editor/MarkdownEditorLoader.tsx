import { lazy, Suspense } from 'solid-js';
import type { MarkdownEditorProps } from './MarkdownEditor';

const MarkdownEditor = lazy(() => import('./MarkdownEditor'));

function MarkdownEditorLoader(props: MarkdownEditorProps) {
  return (
    <Suspense
      fallback={
        <div
          class="overflow-hidden rounded-2xl border border-line bg-surface"
          style={{ 'min-height': `${props.minHeight ?? 260}px` }}
          aria-busy="true"
          aria-label={props.ariaLabel ?? props.placeholder}
        />
      }
    >
      <MarkdownEditor {...props} />
    </Suspense>
  );
}

export default MarkdownEditorLoader;
