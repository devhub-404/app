import { lazy, Show, Suspense } from 'solid-js';
import type { Question } from '@/features/q-and-a/types/q-and-a.type.ts';
import { routes } from '@/shared/navigation/routes';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/q-and-a/i18n';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import RetryErrorState from '@/shared/ui/components/feedback/retry-error-state.component.tsx';
import { useQuestionDetail } from '@/features/q-and-a/ui/hooks/use-question-detail.hook.ts';
import QuestionDetailHeader from './detail/question-detail-header.component.tsx';
import QuestionAnswers from './detail/question-answers.component.tsx';

const QuestionAnswerComposer = lazy(() => import('./detail/question-answer-composer.component.tsx'));

type Props = {
  id: string;
  initialItem?: Question | null;
  initialError?: boolean;
};

function QuestionDetail(props: Props) {
  const { t } = useI18n();
  const detail = useQuestionDetail(props);

  return (
    <Show when={!detail.loading()} fallback={<LoadingState>{t('questiondetail.loadingQuestion')}</LoadingState>}>
      <Show
        when={!detail.loadError()}
        fallback={
          <RetryErrorState
            message={t('questiondetail.couldNotLoadQuestion')}
            retryLabel={t('questiondetail.tryAgain')}
            onRetry={() => void detail.reload()}
          />
        }
      >
        <Show when={detail.item()} fallback={<p class="text-muted">{t('questiondetail.questionNotFound')}</p>}>
          {(question) => (
            <article class="mx-auto max-w-4xl space-y-7">
              <QuestionDetailHeader
                question={question()}
                busy={detail.busy()}
                solved={detail.isSolved()}
                canClose={detail.canClose()}
                canReopen={detail.canReopen()}
                canHide={detail.canHide()}
                canUnhide={detail.canUnhide()}
                canDelete={detail.canDeleteCurrentQuestion()}
                onModerate={(operation) => void detail.moderateQuestion(operation)}
                onDelete={() => void detail.deleteCurrentQuestion()}
                onShare={() => void detail.share(question().title)}
              />

              <section class="rounded-2xl border border-line bg-surface-elevated p-5 sm:p-6">
                <h2 class="heading-tiny text-xs">
                  {t('newquestion.question')}
                </h2>
                <div class="prose mt-5 whitespace-pre-wrap text-content">{question().content}</div>
              </section>

              <QuestionAnswers
                question={question()}
                answers={detail.answers()}
                busy={detail.busy()}
                canModerate={detail.canModerate()}
                canAccept={detail.canAccept()}
                canDelete={detail.canDeleteAnswer}
                onDelete={(answerId) => void detail.deleteAnswer(answerId)}
                onModerate={(answerId, operation) => void detail.moderateAnswer(answerId, operation)}
                onVote={(answerId) => void detail.toggleAnswerVote(answerId)}
                onShare={(answerId) => void detail.share(`Resposta a: ${question().title}`, `answer-${answerId}`)}
                onAccept={(answerId) => void detail.acceptAnswer(answerId)}
                onRemoveAcceptance={() => void detail.removeAcceptedAnswer()}
              />

              <Show when={detail.canSubmitAnswer()}>
                <Show
                  when={detail.authenticated()}
                  fallback={
                    <div class="rounded-2xl border border-line p-5 text-sm text-content-muted">
                      {t('questiondetail.betweenAnswer')}
                      <a
                        class="font-semibold text-content-accent"
                        href={`${routes.auth.signIn}?redirect=${encodeURIComponent(detail.returnTo())}`}
                      >
                        {t('questiondetail.makeLogin')}
                      </a>
                    </div>
                  }
                >
                  <Suspense>
                    <QuestionAnswerComposer
                      busy={detail.busy()}
                      onSubmit={async (value) => {
                        await detail.submitAnswer(value);
                      }}
                    />
                  </Suspense>
                </Show>
              </Show>

              <Show when={question().status === 'closed'}>
                <p class="text-muted rounded-2xl border border-line bg-surface-subtle p-5">
                  {t('questiondetail.thisQuestionWasClosedNotAcceptedNewAnswers')}
                </p>
              </Show>
              <Show when={detail.shareMessage()}>
                <p class="text-muted">{detail.shareMessage()}</p>
              </Show>
              <Show when={detail.error()}>
                <p role="alert" class="text-danger">
                  {detail.error()}
                </p>
              </Show>
            </article>
          )}
        </Show>
      </Show>
    </Show>
  );
}

export default withLocale(QuestionDetail);
