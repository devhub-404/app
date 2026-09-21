import { For, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { createForm, reset, setValue } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { MessageCircle, Pencil, Send, Trash, X } from 'lucide-solid';
import { formatDate } from '@utilify/core';
import { createComment, deleteComment, updateComment } from '@/features/comment/actions/comment.action.ts';
import type { CommentDTO } from '@/features/comment/types/comment.type.ts';
import { useI18n } from '@/features/comment/i18n';
import { createCommentFormSchema, type CommentFormInput } from '@/features/comment/ui/schemas/forms.schema.ts';
import { ReportButton } from '@/features/report/public';

export default function CommentThread(props: {
  comments: CommentDTO[];
  contentId: string;
  targetType: 'article' | 'news';
  authenticated: boolean;
  username: string | null;
  onReload: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const { t, locale } = useI18n();
  const commentSchema = createCommentFormSchema(locale());
  const [state, setState] = createStore({
    editingId: null as string | null,
    replyingToId: null as string | null,
    confirmDeleteId: null as string | null,
    busyId: null as string | null,
  });
  const [editForm, { Form: EditForm, Field: EditField }] = createForm<CommentFormInput>({
    validate: zodForm(commentSchema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });
  const [replyForm, { Form: ReplyForm, Field: ReplyField }] = createForm<CommentFormInput>({
    validate: zodForm(commentSchema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });

  const isMine = (comment: CommentDTO) =>
    Boolean(!comment.deletedAt && props.username && comment.author?.username === props.username);

  const openReply = (commentId: string) => {
    setState({ editingId: null, confirmDeleteId: null });
    if (state.replyingToId === commentId) {
      setState('replyingToId', null);
      reset(replyForm);
      return;
    }
    setState('replyingToId', commentId);
    reset(replyForm);
    setValue(replyForm, 'parentId', commentId);
  };

  const openEdit = (comment: CommentDTO) => {
    setState({ confirmDeleteId: null, replyingToId: null });
    reset(replyForm);
    if (state.editingId === comment.id) {
      setState('editingId', null);
      reset(editForm);
      return;
    }
    setState('editingId', comment.id);
    reset(editForm);
    setValue(editForm, 'content', comment.content ?? '');
  };

  const submitReply = async (parentId: string, values: CommentFormInput) => {
    if (!props.authenticated || state.busyId) return;
    const parsed = commentSchema.safeParse({ ...values, parentId });
    if (!parsed.success) {
      props.onError(parsed.error.issues[0]?.message ?? t('comments.createError'));
      return;
    }
    setState('busyId', `reply:${parentId}`);
    props.onError('');
    try {
      const created = await createComment(props.targetType, props.contentId, parsed.data);
      if (!created) {
        props.onError(t('comments.createError'));
        return;
      }
      reset(replyForm);
      setState('replyingToId', null);
      await props.onReload();
    } finally {
      setState('busyId', null);
    }
  };

  const saveEdit = async (comment: CommentDTO, values: CommentFormInput) => {
    if (comment.deletedAt || state.busyId || !props.authenticated) return;
    const parsed = commentSchema.safeParse({ content: values.content });
    if (!parsed.success) {
      props.onError(parsed.error.issues[0]?.message ?? t('comments.updateError'));
      return;
    }
    setState('busyId', comment.id);
    props.onError('');
    try {
      const updated = await updateComment(comment.id, { content: parsed.data.content });
      if (!updated) {
        props.onError(t('comments.updateError'));
        return;
      }
      reset(editForm);
      setState('editingId', null);
      await props.onReload();
    } finally {
      setState('busyId', null);
    }
  };

  const remove = async (comment: CommentDTO) => {
    if (comment.deletedAt || state.busyId || !props.authenticated) return;
    setState('busyId', comment.id);
    props.onError('');
    try {
      const removed = await deleteComment(comment.id);
      if (!removed) {
        props.onError(t('comments.deleteError'));
        return;
      }
      setState('confirmDeleteId', null);
      await props.onReload();
    } finally {
      setState('busyId', null);
    }
  };

  const CommentNode = (nodeProps: { comment: CommentDTO; depth: number }) => {
    const comment = () => nodeProps.comment;
    const replyBusy = () => state.busyId === `reply:${comment().id}`;

    return (
      <div class={nodeProps.depth > 0 ? 'ml-4 border-l border-line pl-4 sm:ml-6 sm:pl-5' : ''}>
        <article class="rounded-2xl border border-line bg-surface p-4 text-sm text-content">
          <div class="flex items-start justify-between gap-3">
            <div class="text-xs text-content-muted">
              <span>
                {comment().deletedAt
                  ? t('comments.deleted')
                  : comment().author?.displayName || comment().author?.username || t('comments.anonymous')}
              </span>
              <span class="ml-2">{formatDate(new Date(comment().createdAt), 'DMY')}</span>
            </div>
          </div>

          <Show when={!comment().deletedAt}>
            <Show
              when={state.editingId === comment().id}
              fallback={
                <p class="text-body mt-2 whitespace-pre-line">
                  {comment().content}
                </p>
              }
            >
              <EditForm onSubmit={(values) => saveEdit(comment(), values)} class="mt-3 space-y-2">
                <label for={`comment-edit-${comment().id}`} class="field-label">{t('comments.editLabel')}</label>
                <EditField name="content">
                  {(_, fieldProps) => <textarea {...fieldProps} id={`comment-edit-${comment().id}`} class="field-control resize-y min-h-20" />}
                </EditField>
                <div class="flex justify-end">
                  <button
                    type="submit"
                    disabled={state.busyId === comment().id} aria-busy={state.busyId === comment().id} class="action action-secondary"
                   
                   
                  >
                    {state.busyId === comment().id ? t('comments.saving') : t('comments.save')}
                  </button>
                </div>
              </EditForm>
            </Show>
          </Show>

          <div class="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-content-muted">
            <Show when={props.authenticated}>
              <button
                type="button"
                aria-label={state.replyingToId === comment().id ? t('comments.cancel') : t('comments.comment')}
                title={state.replyingToId === comment().id ? t('comments.cancel') : t('comments.comment')}
                onClick={() => openReply(comment().id)} class="action action-secondary"
               
              >
                {state.replyingToId === comment().id ? <X class="size-4" /> : <MessageCircle class="size-4" />}
              </button>
            </Show>

            <Show when={!isMine(comment()) && props.authenticated}>
              <ReportButton target="comment" id={comment().id} locale={locale()} />
            </Show>

            <Show when={isMine(comment())}>
              <button
                type="button"
                aria-label={state.editingId === comment().id ? t('comments.cancel') : t('comments.edit')}
                title={state.editingId === comment().id ? t('comments.cancel') : t('comments.edit')}
                onClick={() => openEdit(comment())} class="action action-secondary"
               
              >
                {state.editingId === comment().id ? <X class="size-4" /> : <Pencil class="size-4" />}
              </button>
              <button
                type="button"
                aria-label={t('comments.remove')}
                title={t('comments.remove')}
                onClick={() => {
                  setState({ editingId: null, replyingToId: null, confirmDeleteId: comment().id });
                  reset(editForm);
                  reset(replyForm);
                }} class="action action-secondary"
               
              >
                <Trash class="size-4" />
              </button>
            </Show>
          </div>

          <Show when={state.replyingToId === comment().id}>
            <ReplyForm
              onSubmit={(values) => submitReply(comment().id, values)}
              class="mt-3 rounded-2xl border border-line bg-surface p-3"
            >
              <label for={`comment-reply-${comment().id}`} class="field-label">{t('comments.replyLabel')}</label>
              <ReplyField name="content">
                {(_, fieldProps) => (
                  <textarea
                    {...fieldProps}
                    id={`comment-reply-${comment().id}`}
                    class="field-control resize-y mt-2 min-h-20"
                    placeholder={t('comments.replyPlaceholder')}
                  />
                )}
              </ReplyField>
              <div class="mt-2 flex justify-end">
                <button type="submit" disabled={replyBusy()} aria-busy={replyBusy()} class="action action-primary">
                  <Send class="size-4" aria-hidden="true" />
                  {replyBusy() ? t('comments.sending') : t('comments.reply')}
                </button>
              </div>
            </ReplyForm>
          </Show>

          <Show when={state.confirmDeleteId === comment().id}>
            <div class="mt-3 rounded-2xl border border-danger-border bg-danger-bg p-3" role="group">
              <p class="text-body">{t('comments.removeConfirm')}</p>
              <div class="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={state.busyId === comment().id}
                  onClick={() => void remove(comment())} class="action action-danger"
                 
                >
                  <Trash class="size-4" aria-hidden="true" />
                  {state.busyId === comment().id ? t('comments.removing') : t('comments.removeConfirmAction')}
                </button>
                <button type="button" onClick={() => setState('confirmDeleteId', null)} class="action action-secondary">
                  {t('comments.cancel')}
                </button>
              </div>
            </div>
          </Show>
        </article>

        <Show when={(comment().children?.length ?? 0) > 0}>
          <div class="mt-3 space-y-3">
            <For each={comment().children ?? []}>
              {(child) => <CommentNode comment={child} depth={nodeProps.depth + 1} />}
            </For>
          </div>
        </Show>
      </div>
    );
  };

  return (
    <div class="space-y-3">
      <For each={props.comments} fallback={<p class="text-muted">{t('comments.empty')}</p>}>
        {(comment) => <CommentNode comment={comment} depth={0} />}
      </For>
    </div>
  );
}
