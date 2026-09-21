import { createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';
import {
  archiveArticle,
  deleteArticle as deleteArticleAction,
  loadArticleById,
  publishArticle,
  unarchiveArticle,
  updateArticle,
} from '@/features/article/actions/article.action.ts';
import type { ArticleFormInput } from '../schemas/forms.schema.ts';
import { createMarkdownPatch } from '@/shared/ui/editor/content';
import { uploadImage } from '@/shared/media/media.service';
import { notifyError, notifySuccess } from '@/shared/ui/feedback/notifications';
import { useAccount } from '@/features/account/public';
import {
  canArchiveArticle,
  canDeleteArticle,
  canEditArticle,
  canPublishArticle,
  canUnarchiveArticle,
} from '@/features/article/access/article.access.ts';
import {
  isArticleArchivable,
  isArticlePublishable,
  isArticleUnarchivable,
} from '@/features/article/domain/article.domain.ts';
import { useI18n } from '@/features/article/i18n';

type ArticleStatus = 'draft' | 'published' | 'archived';

type EditArticleState = {
  loading: boolean;
  saving: boolean;
  articleId: string | null;
  authorAccountId: string | null;
  slug: string;
  status: ArticleStatus;
  formDefaults: ArticleFormInput;
  baseContent: string;
  version: number;
  publishedAt: string | null;
  updatedAt: string | null;
  hiddenAt: string | null;
  hideReason: string | null;
  coverUrl: string;
  coverFile: File | null;
  coverChanged: boolean;
  votes: number;
  views: number;
  comments: number;
  error: string | null;
  message: string | null;
  conflict: { content: string; version: number } | null;
  preview: boolean;
};

export function useEditArticle(id: () => string) {
  const { t } = useI18n();
  const { state: account } = useAccount();
  const [state, setState] = createStore<EditArticleState>({
    loading: true,
    saving: false,
    articleId: null,
    authorAccountId: null,
    slug: '',
    status: 'draft',
    formDefaults: { title: '', description: '', content: '', tags: [] },
    baseContent: '',
    version: 1,
    publishedAt: null,
    updatedAt: null,
    hiddenAt: null,
    hideReason: null,
    coverUrl: '',
    coverFile: null,
    coverChanged: false,
    votes: 0,
    views: 0,
    comments: 0,
    error: null,
    message: null,
    conflict: null,
    preview: false,
  });

  createEffect(() => {
    setState('loading', true);
    void loadArticleById(id())
      .then((item) => {
        if (!item) return;
        setState({
          articleId: item.id,
          authorAccountId: item.authorAccountId,
          slug: item.slug,
          status: item.status,
          formDefaults: {
            title: item.title,
            description: item.description,
            content: item.content,
            tags: item.tags.map((tag) => tag.slug),
          },
          baseContent: item.content,
          version: item.contentVersion ?? 1,
          publishedAt: item.publishedAt,
          updatedAt: item.updatedAt,
          hiddenAt: item.hiddenAt,
          hideReason: item.hideReason,
          coverUrl: item.coverImageUrl ?? '',
          coverFile: null,
          coverChanged: false,
          votes: item.votes,
          views: item.views,
          comments: item.commentCount,
          conflict: null,
        });
      })
      .catch(() => notifyError())
      .finally(() => setState('loading', false));
  });

  createEffect(() => {
    if (state.hiddenAt && state.hideReason) {
      setState('message', t('articleform.hidingModerationValue0', [state.hideReason]));
    }
  });

  const actor = () => ({
    accountId: account().details?.account.id ?? null,
    role: account().details?.role ?? null,
    organizationIds: [],
    ownerOrganizationIds: [],
  });

  const subject = () => ({
    authorAccountId: state.authorAccountId,
    status: state.status,
    hiddenAt: state.hiddenAt,
  });

  const canEdit = () => canEditArticle(subject(), actor());
  const canPublish = () => canPublishArticle(subject(), actor()) && isArticlePublishable(subject());
  const canArchive = () => canArchiveArticle(subject(), actor()) && isArticleArchivable(subject());
  const canUnarchive = () => canUnarchiveArticle(subject(), actor()) && isArticleUnarchivable(subject());
  const canDelete = () => canDeleteArticle(subject(), actor());

  const readyForOperation = () => Boolean(state.articleId) && !state.loading && !state.saving;
  const canSaveNow = () => canEdit() && readyForOperation();
  const canPublishNow = () => canPublish() && readyForOperation();
  const canArchiveNow = () => canArchive() && readyForOperation();
  const canUnarchiveNow = () => canUnarchive() && readyForOperation();
  const canDeleteNow = () => canDelete() && readyForOperation();

  const selectCover = (file: File) => {
    setState({ coverFile: file, coverChanged: true, coverUrl: URL.createObjectURL(file) });
  };

  const removeCover = () => {
    setState({ coverFile: null, coverUrl: '', coverChanged: true });
  };

  const save = async (formValue: ArticleFormInput) => {
    if (!canSaveNow() || !state.articleId) return false;
    setState({ error: null, message: null });
    const value: ArticleFormInput = {
      title: formValue.title.trim(),
      description: formValue.description.trim(),
      content: formValue.content.trim(),
      tags: formValue.tags ?? [],
    };

    setState('saving', true);
    try {
      let coverMediaId: string | undefined;
      if (state.coverFile) {
        const uploaded = await uploadImage(state.coverFile, 'content');
        if (uploaded.error || !uploaded.data?.data?.mediaId) {
          notifyError(uploaded.error?.code);
          setState('error', t('articleform.couldNotSendCover'));
          return false;
        }
        coverMediaId = uploaded.data.data.mediaId;
      }

      const result = await updateArticle(state.articleId, {
        title: value.title,
        description: value.description,
        tagSlugs: value.tags,
        ...(coverMediaId ? { coverMediaId } : {}),
        ...(state.coverChanged && !coverMediaId ? { coverMediaId: null } : {}),
        contentPatch: createMarkdownPatch(state.baseContent, value.content),
        baseContentVersion: state.version,
      });

      if (result.kind === 'failure') {
        if (result.conflict) setState('conflict', result.conflict);
        notifyError(result.code);
        return false;
      }

      notifySuccess(result.code);
      {
        setState({
          formDefaults: value,
          baseContent: value.content,
          coverFile: null,
          coverChanged: false,
          updatedAt: new Date().toISOString(),
          message: t('articleform.changesSaved'),
        });
        setState('version', (current) => current + 1);
      }
      return true;
    } catch {
      notifyError();
      return false;
    } finally {
      setState('saving', false);
    }
  };

  const runLifecycle = async (
    operation: () => ReturnType<typeof publishArticle>,
    nextStatus?: ArticleStatus,
    nextPublishedAt?: string,
  ) => {
    if (!state.articleId) return false;
    setState('saving', true);
    try {
      const result = await operation();
      if (result.kind === 'failure') {
        notifyError(result.code);
        return false;
      }

      notifySuccess(result.code);
      if (nextStatus) {
        setState('status', nextStatus);
        if (nextStatus === 'published') setState('publishedAt', nextPublishedAt ?? new Date().toISOString());
      }
      setState('message', t('articleform.changeSaved'));
      return true;
    } catch {
      notifyError();
      return false;
    } finally {
      setState('saving', false);
    }
  };

  const publish = async (publishedAt?: string) => {
    if (!canPublishNow() || !state.articleId) return false;
    return runLifecycle(() => publishArticle(state.articleId!, publishedAt), 'published', publishedAt);
  };

  const archive = async () => {
    if (!canArchiveNow() || !state.articleId) return false;
    return runLifecycle(() => archiveArticle(state.articleId!), 'archived');
  };

  const unarchive = async () => {
    if (!canUnarchiveNow() || !state.articleId) return false;
    return runLifecycle(() => unarchiveArticle(state.articleId!), 'published');
  };

  const deleteArticle = async () => {
    if (!canDeleteNow() || !state.articleId) return false;
    setState('saving', true);
    try {
      const result = await deleteArticleAction(state.articleId);
      if (result.kind === 'failure') {
        notifyError(result.code);
        return false;
      }
      notifySuccess(result.code);
      setState('message', t('articleform.articleDeleted'));
      return true;
    } catch {
      notifyError();
      return false;
    } finally {
      setState('saving', false);
    }
  };

  return {
    loading: () => state.loading,
    saving: () => state.saving,
    slug: () => state.slug,
    status: () => state.status,
    formDefaults: () => state.formDefaults,
    version: () => state.version,
    publishedAt: () => state.publishedAt,
    updatedAt: () => state.updatedAt,
    hiddenAt: () => state.hiddenAt,
    coverUrl: () => state.coverUrl,
    votes: () => state.votes,
    views: () => state.views,
    comments: () => state.comments,
    error: () => state.error,
    message: () => state.message,
    conflict: () => state.conflict,
    preview: () => state.preview,
    setPreview: (value: boolean) => setState('preview', value),
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
    deleteArticle,
  };
}
