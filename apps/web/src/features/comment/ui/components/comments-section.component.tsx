import { createMemo, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { createForm, reset } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { Send } from 'lucide-solid';
import { createComment, listComments } from '@/features/comment/actions/comment.action.ts';
import type { CommentDTO } from '@/features/comment/types/comment.type.ts';
import { useAccount } from '@/features/account/public/account-state';
import { useAuthSession } from '@/features/auth/public/session';
import { routes } from '@/shared/navigation/routes';
import { useI18n } from '@/features/comment/i18n';
import CommentThread from './comment-thread.component.tsx';
import { createCommentFormSchema, type CommentFormInput } from '@/features/comment/ui/schemas/forms.schema.ts';

import { withLocale } from '@/shared/i18n/core/solid';
function CommentsSection(props: { id?: string; contentId: string; targetType: 'article' | 'news' }) {
  const { state: account } = useAccount();
  const { authenticated } = useAuthSession();
  const { t, locale } = useI18n();
  const commentSchema = createCommentFormSchema(locale());
  const [state, setState] = createStore({
    comments: [] as CommentDTO[],
    loading: true,
    error: '',
    submitting: false,
  });
  const [_form, { Form, Field }] = createForm<CommentFormInput>({
    validate: zodForm(commentSchema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });
  const username = () => account().details?.profile?.username ?? null;
  const visibleCount = createMemo(() => {
    const count = (items: CommentDTO[]): number =>
      items.reduce((total, item) => total + (item.deletedAt ? 0 : 1) + count(item.children ?? []), 0);
    return count(state.comments);
  });

  const reload = async () => {
    setState('loading', true);
    setState('error', '');
    try {
      setState('comments', await listComments(props.targetType, props.contentId));
    } catch {
      setState('error', t('comments.loadError'));
    } finally {
      setState('loading', false);
    }
  };

  onMount(() => void reload());

  const submitComment = async (values: CommentFormInput) => {
    if (state.submitting || !authenticated()) return;
    const parsed = commentSchema.safeParse(values);
    if (!parsed.success) return;
    setState('submitting', true);
    setState('error', '');
    try {
      const created = await createComment(props.targetType, props.contentId, { content: parsed.data.content });
      if (!created) {
        setState('error', t('comments.createError'));
        return;
      }
      reset(_form);
      await reload();
    } finally {
      setState('submitting', false);
    }
  };

  const redirectPath = () =>
    typeof window === 'undefined' ? routes.home : window.location.pathname + window.location.search;

  return (
    <section
      id={props.id}
      class="space-y-5 rounded-3xl border border-line bg-surface-subtle p-5 sm:p-6"
      aria-labelledby="comments-heading"
    >
      <header>
        <h2 id="comments-heading" class="heading-card text-lg">
          {t('comments.title')} <span class="text-content-muted">· {state.loading ? '…' : visibleCount()}</span>
        </h2>
        <p class="text-muted mt-1">
          {t('comments.description')}
        </p>
      </header>

      <Show
        when={authenticated()}
        fallback={
          <div class="rounded-2xl border border-line bg-surface p-4 text-sm text-content-muted">
            {t('comments.signInPrompt')}{' '}
            <a
              class="font-semibold text-content-accent"
              href={`${routes.auth.signIn}?redirect=${encodeURIComponent(redirectPath())}`}
            >
              {t('comments.signIn')}
            </a>
          </div>
        }
      >
        <Form onSubmit={submitComment} class="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-4">
          <label for="new-comment" class="field-label">{t('comments.new')}</label>
          <Field name="content">
            {(_, fieldProps) => (
              <textarea
                {...fieldProps}
                id="new-comment"
                required
                class="field-control resize-y min-h-24"
                placeholder={t('comments.placeholder')}
              />
            )}
          </Field>
          <div class="flex justify-end">
            <button type="submit" disabled={state.submitting} aria-busy={state.submitting} class="action action-primary">
              <Send class="size-4" />
              {state.submitting ? t('comments.sending') : t('comments.send')}
            </button>
          </div>
        </Form>
      </Show>

      <Show when={state.error}>
        <p role="status" class="text-danger rounded-2xl border border-danger-border bg-danger-bg p-3">
          {state.error}
        </p>
      </Show>
      <Show when={state.loading}>
        <p role="status" class="text-muted">
          {t('comments.loading')}
        </p>
      </Show>

      <Show when={!state.loading}>
        <CommentThread
          comments={state.comments}
          contentId={props.contentId}
          targetType={props.targetType}
          authenticated={authenticated()}
          username={username()}
          onReload={reload}
          onError={(message) => setState('error', message)}
        />
      </Show>
    </section>
  );
}

export default withLocale(CommentsSection);
