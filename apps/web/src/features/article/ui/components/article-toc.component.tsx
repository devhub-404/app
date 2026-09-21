import { createSignal, For, onMount, Show } from 'solid-js';
import { useI18n } from '@/features/article/i18n';
import { withLocale } from '@/shared/i18n/core/solid';
type ArticleTocEntry = { id: string; label: string; level: number };

const headingId = (label: string, index: number) =>
  `article-section-${
    label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'section'
  }-${index + 1}`;

function ArticleToc(props: { mode: 'mobile' | 'desktop' }) {
  const { t } = useI18n();
  const [entries, setEntries] = createSignal<ArticleTocEntry[]>([]);

  onMount(() => {
    const root = document.getElementById('article-content');
    if (!root) return;
    setEntries(
      Array.from(root.querySelectorAll<HTMLElement>('h2, h3')).map((element, index) => {
        const id = element.id || headingId(element.textContent ?? '', index);
        element.id = id;
        return {
          id,
          label: element.textContent?.trim() || t('articledetail.section'),
          level: element.tagName === 'H3' ? 3 : 2,
        };
      }),
    );
  });

  return (
    <Show when={entries().length > 0}>
      {props.mode === 'mobile' ? (
        <details class="rounded-2xl border border-line bg-surface p-4 lg:hidden">
          <summary class="cursor-pointer text-sm font-semibold text-content">{t('articledetail.indexArticle')}</summary>
          <nav class="mt-3 space-y-2" aria-label={t('articledetail.indexArticle')}>
            <For each={entries()}>
              {(entry) => (
                <a
                  href={`#${entry.id}`}
                  class={`block text-sm text-content-muted hover:text-content-accent ${entry.level === 3 ? 'pl-3 text-xs' : ''}`}
                >
                  {entry.label}
                </a>
              )}
            </For>
          </nav>
        </details>
      ) : (
        <nav class="rounded-2xl border border-line bg-surface p-5" aria-label={t('articledetail.indexArticle')}>
          <h2 class="heading-tiny text-xs">
            {t('articledetail.indexArticle')}
          </h2>
          <div class="mt-4 space-y-2">
            <For each={entries()}>
              {(entry) => (
                <a
                  href={`#${entry.id}`}
                  class={`block text-sm text-content-muted hover:text-content-accent ${entry.level === 3 ? 'pl-3 text-xs' : ''}`}
                >
                  {entry.label}
                </a>
              )}
            </For>
          </div>
        </nav>
      )}
    </Show>
  );
}

export default withLocale(ArticleToc);
