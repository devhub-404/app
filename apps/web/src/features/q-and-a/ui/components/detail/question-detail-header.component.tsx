import { Circle, CircleCheck, EyeOff, Lock, LockOpen, Share2, Trash } from 'lucide-solid';
import { For, Show } from 'solid-js';
import type { Question } from '@/features/q-and-a/types/q-and-a.type.ts';
import TagLink from '@/shared/ui/components/navigation/tag-link.component.tsx';
import { routes } from '@/shared/navigation/routes';
import { formatLocalizedDate } from '@/shared/i18n/core';
import { useI18n } from '@/features/q-and-a/i18n';

export default function QuestionDetailHeader(props: {
  question: Question;
  busy: boolean;
  solved: boolean;
  canClose: boolean;
  canReopen: boolean;
  canHide: boolean;
  canUnhide: boolean;
  canDelete: boolean;
  onModerate: (operation: 'close' | 'reopen' | 'hide' | 'unhide') => void;
  onDelete: () => void;
  onShare: () => void;
}) {
  const { t, locale } = useI18n();
  const createdAt = () =>
    props.question.createdAt
      ? formatLocalizedDate(props.question.createdAt, locale(), {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';

  return (
    <header class="border-b border-line pb-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div
            class={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] ${props.solved ? 'text-success' : props.question.status === 'closed' ? 'text-content-muted' : 'text-content-accent'}`}
          >
            {props.solved ? <CircleCheck class="size-4" /> : <Circle class="size-3 fill-current" />}
            {props.solved
              ? t('questiondetail.solved')
              : props.question.status === 'closed'
                ? t('questiondetail.closed')
                : t('questiondetail.open')}
          </div>
          <h1 class="heading-page mt-4">
            {props.question.title}
          </h1>
          <p class="text-muted mt-4">
            {t('questiondetail.question')}
            <Show when={props.question.author} fallback={<>{t('questiondetail.anonymous')}</>}>
              <a class="font-semibold text-content-accent" href={routes.profile(props.question.author!.username)}>
                {props.question.author!.displayName || props.question.author!.username}
              </a>
            </Show>
            · {createdAt()}
          </p>
        </div>
        <div class="flex flex-wrap justify-end gap-2">
          <Show when={props.canClose || props.canReopen}>
            <button
             
              disabled={props.busy}
              onClick={() => props.onModerate(props.question.status === 'closed' ? 'reopen' : 'close')} class="action action-secondary"
            >
              props.question.status === 'closed' ? <LockOpen class="size-4" /> : <Lock class="size-4" />
              {props.question.status === 'closed' ? t('questiondetail.reopen') : t('questiondetail.close')}
            </button>
          </Show>
          <Show when={props.canHide || props.canUnhide}>
            <button
             
              disabled={props.busy}
              onClick={() => props.onModerate(props.question.hiddenAt ? 'unhide' : 'hide')} class="action action-secondary"
            >
              <EyeOff class="size-4" />
              {props.question.hiddenAt ? t('questiondetail.removeHiding') : t('questiondetail.hide')}
            </button>
          </Show>
          <Show when={props.canDelete}>
            <button disabled={props.busy} onClick={props.onDelete} class="action action-danger-outline">
              <Trash class="size-4" />
              {t('questiondetail.delete')}
            </button>
          </Show>
          <button onClick={props.onShare} aria-label={t('questiondetail.share')} class="action action-secondary">
            <Share2 class="size-4" />
          </button>
        </div>
      </div>
      <div class="mt-4 flex flex-wrap gap-2">
        <For each={props.question.tagSlugs}>{(tag) => <TagLink slug={tag} />}</For>
      </div>
    </header>
  );
}
