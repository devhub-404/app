import { Show } from 'solid-js';
import { formatLocalizedDate } from '@/shared/i18n/core';
import EditorStatusPanel from '@/shared/ui/editor/components/editor-status-panel.component.tsx';
import { useI18n } from '@/features/news/i18n';
import { Save, Send } from 'lucide-solid';

interface Props {
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;
  updatedAt: string | null;
  version: number;
  canPublish: boolean;
  saveAvailable: boolean;
  publishAvailable: boolean;
  onSave: () => void;
  onPublish: () => void;
}

export default function NewsEditorStatusPanel(props: Props) {
  const { t, locale } = useI18n();
  const formatDate = (value: string | null) =>
    value
      ? formatLocalizedDate(value, locale(), {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';

  return (
    <EditorStatusPanel
      heading={t('newsform.status')}
      status={
        <div class="flex items-center gap-2 text-sm font-semibold text-content">
          <span
            class={`size-2 rounded-full ${props.status === 'published' ? 'bg-success' : props.status === 'archived' ? 'bg-disabled' : 'bg-warning'}`}
          />
          {props.status === 'published'
            ? t('newsform.published')
            : props.status === 'archived'
              ? t('news.archived')
              : t('newsform.draft')}
        </div>
      }
      metadata={
        <>
          <Show when={props.publishedAt}>
            <div>
              <dt class="text-content-muted">{t('newsdetail.publishedAt')}</dt>
              <dd class="mt-1 font-medium text-content">{formatDate(props.publishedAt)}</dd>
            </div>
          </Show>
          <div>
            <dt class="text-content-muted">{t('newsdetail.updatedAt')}</dt>
            <dd class="mt-1 font-medium text-content">{formatDate(props.updatedAt)}</dd>
          </div>
        </>
      }
      versionLabel={t('newsform.version')}
      version={props.version}
      actions={
        <>
          <button type="button" disabled={!props.saveAvailable} onClick={props.onSave} class="action action-secondary">
            <Save class="size-4" />
            {t('newsform.saveChanges')}
          </button>
          <Show when={props.canPublish}>
            <button type="button" disabled={!props.publishAvailable} onClick={props.onPublish} class="action action-primary">
              <Send class="size-4" />
              {t('newsform.publishNews')}
            </button>
          </Show>
        </>
      }
    />
  );
}
