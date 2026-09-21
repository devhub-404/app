import { createSignal, Show } from 'solid-js';
import EditorStatusPanel from '@/shared/ui/editor/components/editor-status-panel.component.tsx';
import { formatLocalizedDate, type Locale } from '@/shared/i18n/core';
import { useI18n } from '@/features/article/i18n';
import { Save, Send } from 'lucide-solid';

const formatDate = (value: string | null | undefined, locale: Locale) =>
  value ? formatLocalizedDate(value, locale, { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

interface Props {
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;
  updatedAt: string | null;
  version: number;
  slug: string;
  canPublish: boolean;
  publishAvailable: boolean;
  saveAvailable: boolean;
  onPublish: (publishedAt?: string) => void;
  onSave: () => void;
}

export default function ArticleEditorStatusPanel(props: Props) {
  const { t, locale } = useI18n();
  const [publishAt, setPublishAt] = createSignal('');
  const publish = () => {
    const value = publishAt();
    props.onPublish(value ? new Date(value).toISOString() : undefined);
  };
  return (
    <EditorStatusPanel
      heading={t('articleform.status')}
      status={
        <div class="flex items-center gap-2 text-sm font-semibold text-content">
          <span class={`size-2 rounded-full ${props.status === 'published' ? 'bg-success' : 'bg-warning'}`} />
          {props.status === 'published'
            ? t('articleform.published')
            : props.status === 'draft'
              ? t('articleform.draft')
              : t('article.unpublished')}
        </div>
      }
      metadata={
        <>
          <Show when={props.publishedAt}>
            <div>
              <dt class="text-content-muted">{t('articledetail.published')}</dt>
              <dd class="mt-1 font-medium text-content">{formatDate(props.publishedAt, locale())}</dd>
            </div>
          </Show>
          <div>
            <dt class="text-content-muted">{t('articledetail.updated')}</dt>
            <dd class="mt-1 font-medium text-content">{formatDate(props.updatedAt, locale())}</dd>
          </div>
        </>
      }
      versionLabel={t('articleform.version')}
      version={props.version}
      actions={
        <>
          <Show when={props.canPublish}>
            <div class="grid gap-1.5">
              <label class="field-label">{t('articleform.publishAtOptional')}</label>
              <input
                type="datetime-local"
                value={publishAt()}
                onInput={(event) => setPublishAt(event.currentTarget.value)}
               class="field-control"/>
            </div>
            <button type="button" disabled={!props.publishAvailable} onClick={publish} class="action action-secondary">
              <Send class="size-4" />
              {t('articleform.publishArticle')}
            </button>
          </Show>
          <button type="button" disabled={!props.saveAvailable} onClick={props.onSave} class="action action-primary">
            <Save class="size-4" />
            {t('articleform.saveChanges')}
          </button>
          <Show when={props.slug}>
            <a href={`/articles/${encodeURIComponent(props.slug)}`} class="action action-secondary">
              {t('articleform.viewArticle')}
            </a>
          </Show>
        </>
      }
    />
  );
}
