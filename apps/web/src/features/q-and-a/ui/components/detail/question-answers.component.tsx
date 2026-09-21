import { For, Show } from 'solid-js';
import type { Question } from '@/features/q-and-a/types/q-and-a.type.ts';
import { useI18n } from '@/features/q-and-a/i18n';
import QuestionAnswerCard from '../question-answer-card.component.tsx';

type Answer = Question['answers'][number];

export default function QuestionAnswers(props: {
  question: Question;
  answers: Answer[];
  busy: boolean;
  canModerate: boolean;
  canAccept: boolean;
  canDelete: (answerId: string) => boolean;
  onDelete: (answerId: string) => void;
  onModerate: (answerId: string, operation: 'hideAnswer' | 'unhideAnswer') => void;
  onVote: (answerId: string) => void;
  onShare: (answerId: string) => void;
  onAccept: (answerId: string) => void;
  onRemoveAcceptance: () => void;
}) {
  const { t } = useI18n();
  const solved = () => Boolean(props.question.acceptedAnswerId);
  return (
    <section class="space-y-4">
      <Show when={props.question.answers.length}>
        <h2 class="heading-tiny text-sm">
          {solved()
            ? t('questiondetail.acceptedAnswer')
            : `${props.question.answers.length} ${props.question.answers.length === 1 ? t('questiondetail.answerOne') : t('questiondetail.answerMany')}`}
        </h2>
      </Show>
      <For each={props.answers}>
        {(entry) => (
          <QuestionAnswerCard
            answer={entry}
            accepted={props.question.acceptedAnswerId === entry.id}
            busy={props.busy}
            canDelete={props.canDelete(entry.id)}
            canModerate={props.canModerate}
            canAccept={props.canAccept}
            onDelete={() => props.onDelete(entry.id)}
            onModerate={() => props.onModerate(entry.id, entry.hiddenAt ? 'unhideAnswer' : 'hideAnswer')}
            onVote={() => props.onVote(entry.id)}
            onShare={() => props.onShare(entry.id)}
            onAccept={() => props.onAccept(entry.id)}
            onRemoveAcceptance={props.onRemoveAcceptance}
          />
        )}
      </For>
    </section>
  );
}
