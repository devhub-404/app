import { createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';
import {
  archiveNews,
  deleteNews as deleteNewsAction,
  loadNewsById,
  publishNews,
  unarchiveNews,
  updateNews,
  type NewsMutationResult,
} from '@/features/news/actions/news.action.ts';
import type { NewsFormInput } from '../schemas/forms.schema.ts';
import { createMarkdownPatch } from '@/shared/ui/editor/content';
import { uploadImage } from '@/shared/media/media.service';
import { notifyError } from '@/shared/ui/feedback/notifications';
import { useAccount } from '@/features/account/public';
import {
  canArchiveNews,
  canDeleteNews,
  canEditNews,
  canPublishNews,
  canUnarchiveNews,
} from '@/features/news/access/news.access.ts';
import { isNewsArchivable, isNewsPublishable, isNewsUnarchivable } from '@/features/news/domain/news.domain.ts';
import { useI18n } from '@/features/news/i18n';

type NewsStatus = 'draft' | 'published' | 'archived';

type EditNewsState = {
  loading: boolean;
  saving: boolean;
  newsId: string | null;
  slug: string;
  status: NewsStatus;
  formDefaults: NewsFormInput;
  baseContent: string;
  version: number;
  coverUrl: string;
  coverFile: File | null;
  coverChanged: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
  views: number;
  error: string | null;
  message: string | null;
  conflict: { content: string; version: number } | null;
};

export function useEditNews(id: () => string) {
  const { t } = useI18n();
  const { state: account } = useAccount();
  const [state, setState] = createStore<EditNewsState>({
    loading: true,
    saving: false,
    newsId: null,
    slug: '',
    status: 'draft',
    formDefaults: {
      title: '',
      description: '',
      content: '',
      occurredAt: null,
      sourceUrl: '',
      coverImageUrl: '',
      tags: [],
    },
    baseContent: '',
    version: 1,
    coverUrl: '',
    coverFile: null,
    coverChanged: false,
    publishedAt: null,
    updatedAt: null,
    views: 0,
    error: null,
    message: null,
    conflict: null,
  });

  createEffect(() => {
    setState('loading', true);
    void loadNewsById(id())
      .then((item) => {
        if (!item) return;
        const content = item.content ?? '';
        setState({
          newsId: item.id,
          slug: item.slug,
          status: item.status,
          formDefaults: {
            title: item.title,
            description: item.description,
            content,
            occurredAt: item.occurredAt,
            sourceUrl: '',
            coverImageUrl: item.coverImageUrl ?? '',
            tags: item.tags.map((tag) => tag.slug),
          },
          baseContent: content,
          version: item.contentVersion ?? 1,
          coverUrl: item.coverImageUrl ?? '',
          coverFile: null,
          coverChanged: false,
          publishedAt: item.publishedAt,
          updatedAt: item.updatedAt,
          views: item.views,
          conflict: null,
        });
      })
      .catch(() => notifyError())
      .finally(() => setState('loading', false));
  });

  const actor = () => ({
    accountId: account().details?.account.id ?? null,
    role: account().details?.role ?? null,
    organizationIds: [],
    ownerOrganizationIds: [],
  });
  const subject = () => ({ status: state.status });

  const canEdit = () => canEditNews(actor());
  const canPublish = () => canPublishNews(actor()) && isNewsPublishable(subject());
  const canArchive = () => canArchiveNews(actor()) && isNewsArchivable(subject());
  const canUnarchive = () => canUnarchiveNews(actor()) && isNewsUnarchivable(subject());
  const canDelete = () => canDeleteNews(actor());
  const ready = () => Boolean(state.newsId) && !state.loading && !state.saving;
  const canSaveNow = () => canEdit() && ready();
  const canPublishNow = () => canPublish() && ready();
  const canArchiveNow = () => canArchive() && ready();
  const canUnarchiveNow = () => canUnarchive() && ready();
  const canDeleteNow = () => canDelete() && ready();

  const selectCover = (file: File) => {
    setState({ coverFile: file, coverChanged: true, coverUrl: URL.createObjectURL(file) });
  };

  const removeCover = () => setState({ coverFile: null, coverUrl: '', coverChanged: true });

  const save = async (formValue: NewsFormInput) => {
    if (!canSaveNow() || !state.newsId) return false;
    setState({ error: null, message: null });
    const value: NewsFormInput = {
      ...formValue,
      title: formValue.title.trim(),
      description: formValue.description.trim(),
      content: formValue.content.trim(),
      sourceUrl: formValue.sourceUrl.trim(),
      tags: formValue.tags ?? [],
    };

    setState('saving', true);
    try {
      let coverMediaId: string | undefined;
      if (state.coverFile) {
        const uploaded = await uploadImage(state.coverFile, 'content');
        if (uploaded.error || !uploaded.data?.data?.mediaId) {
          notifyError(uploaded.error?.code);
          setState('error', t('newsform.couldNotSendCover'));
          return false;
        }
        coverMediaId = uploaded.data.data.mediaId;
      }

      const result = await updateNews(state.newsId, {
        title: value.title,
        description: value.description,
        occurredAt: value.occurredAt,
        tagSlugs: value.tags,
        ...(coverMediaId ? { coverMediaId } : {}),
        ...(state.coverChanged && !coverMediaId ? { coverMediaId: null } : {}),
        contentPatch: createMarkdownPatch(state.baseContent, value.content),
        baseContentVersion: state.version,
      });

      if (result.kind === 'failure') {
        if (result.code === 'NEWS_CONTENT_CONFLICT') {
          const latest = await loadNewsById(state.newsId);
          if (latest) setState('conflict', { content: latest.content ?? '', version: latest.contentVersion ?? 1 });
        }
        notifyError(result.code);
        return false;
      }

      setState({
        formDefaults: value,
        baseContent: value.content,
        coverFile: null,
        coverChanged: false,
        updatedAt: new Date().toISOString(),
        conflict: null,
        message: t('newsform.changesSaved'),
      });
      setState('version', (current) => current + 1);
      return true;
    } catch {
      notifyError();
      return false;
    } finally {
      setState('saving', false);
    }
  };

  const runLifecycle = async (operation: () => Promise<NewsMutationResult>, next: NewsStatus) => {
    setState({ saving: true, error: null });
    try {
      const result = await operation();
      if (result.kind === 'failure') {
        notifyError(result.code);
        return false;
      }
      setState({ status: next, message: t('newsform.statusEditorialUpdated') });
      if (next === 'published') setState('publishedAt', new Date().toISOString());
      return true;
    } catch {
      notifyError();
      return false;
    } finally {
      setState('saving', false);
    }
  };

  const publish = async () => {
    if (!canPublishNow() || !state.newsId) return false;
    return runLifecycle(() => publishNews(state.newsId!), 'published');
  };
  const archive = async () =>
    canArchiveNow() && state.newsId ? runLifecycle(() => archiveNews(state.newsId!), 'archived') : false;
  const unarchive = async () =>
    canUnarchiveNow() && state.newsId ? runLifecycle(() => unarchiveNews(state.newsId!), 'published') : false;

  const deleteNews = async () => {
    if (!canDeleteNow() || !state.newsId) return false;
    setState({ saving: true, error: null });
    try {
      const result = await deleteNewsAction(state.newsId);
      if (result.kind === 'failure') {
        notifyError(result.code);
        return false;
      }
      setState('message', t('newsform.newsDeleted'));
      return true;
    } finally {
      setState('saving', false);
    }
  };

  const adoptConflict = () => {
    const latest = state.conflict;
    if (!latest) return;
    setState({
      formDefaults: { ...state.formDefaults, content: latest.content },
      baseContent: latest.content,
      version: latest.version,
      conflict: null,
    });
  };

  return {
    loading: () => state.loading,
    saving: () => state.saving,
    slug: () => state.slug,
    status: () => state.status,
    formDefaults: () => state.formDefaults,
    version: () => state.version,
    coverUrl: () => state.coverUrl,
    publishedAt: () => state.publishedAt,
    updatedAt: () => state.updatedAt,
    views: () => state.views,
    error: () => state.error,
    message: () => state.message,
    conflict: () => state.conflict,
    canEdit,
    canPublish,
    canArchive,
    canUnarchive,
    canDelete,
    canSaveNow,
    canPublishNow,
    canArchiveNow,
    canUnarchiveNow,
    canDeleteNow,
    selectCover,
    removeCover,
    save,
    publish,
    archive,
    unarchive,
    deleteNews,
    adoptConflict,
  };
}
