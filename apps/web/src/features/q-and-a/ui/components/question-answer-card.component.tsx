import { Show } from 'solid-js';
import { Check, Eye, Share2, ThumbsUp, Trash, X } from 'lucide-solid';
import type { Question } from '@/features/q-and-a/types/q-and-a.type.ts';
import { routes } from '@/shared/navigation/routes';
import { formatLocalizedDate } from '@/shared/i18n/core';
import { useI18n } from '@/features/q-and-a/i18n';

type QuestionAnswer = Question['answers'][number];

export default function QuestionAnswerCard(props: {
  answer: QuestionAnswer;
  accepted: boolean;
  busy: boolean;
  canDelete: boolean;
  canModerate: boolean;
  canAccept: boolean;
  onDelete: () => void;
  onModerate: () => void;
  onVote: () => void;
  onShare: () => void;
  onAccept: () => void;
  onRemoveAcceptance: () => void;
}) {
  const { t, locale } = useI18n();
  const formattedDate = () =>
    formatLocalizedDate(props.answer.createdAt, locale(), {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div
      id={`answer-${props.answer.id}`}
      class={`rounded-2xl border p-5 sm:p-6 ${props.accepted ? 'border-action-border bg-action-subtle' : 'border-line bg-surface-elevated'}`}
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2 text-sm text-content-muted">
            <ThumbsUp class="size-4 text-content-accent" />
            {props.answer.votes}
            <span>·</span>
            <span>
              <Show when={props.answer.author} fallback={<>{t('questiondetail.anonymous')}</>}>
                <a class="font-semibold text-content-accent" href={routes.profile(props.answer.author!.username)}>
                  {props.answer.author!.displayName || props.answer.author!.username}
                </a>
              </Show>
              · {formattedDate()}
            </span>
          </div>
          <p class="text-body mt-5 whitespace-pre-wrap">
            {props.answer.content}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Show when={props.canDelete}>
            <button disabled={props.busy} onClick={props.onDelete} class="action action-danger-outline">
              <Trash class="size-4" />
              {t('questiondetail.delete')}
            </button>
          </Show>
          <Show when={props.canModerate}>
            <button disabled={props.busy} onClick={props.onModerate} class="action action-secondary">
              <Eye class="size-4" />
              {props.answer.hiddenAt ? t('questiondetail.showAgain') : t('questiondetail.hide')}
            </button>
          </Show>
        </div>
      </div>
      <div class="mt-5 flex flex-wrap items-center gap-3 text-xs text-content-muted">
        <button disabled={props.busy} onClick={props.onVote} class="action action-secondary">
          <ThumbsUp class="size-4" />
          {t('questiondetail.vote')}
        </button>
        <button onClick={props.onShare} class="action action-secondary">
          <Share2 class="size-4" />
          {t('questiondetail.share')}
        </button>
        <Show when={props.canAccept}>
          <Show
            when={!props.accepted}
            fallback={
              <div class="ml-auto">
                <button disabled={props.busy} onClick={props.onRemoveAcceptance} class="action action-secondary">
                  <X class="size-4" />
                  {t('questiondetail.removeAcceptance')}
                </button>
              </div>
            }
          >
            <div class="ml-auto">
              <button disabled={props.busy} onClick={props.onAccept} class="action action-secondary">
                <Check class="size-4" />
                {t('questiondetail.acceptAnswer')}
              </button>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  );
}
