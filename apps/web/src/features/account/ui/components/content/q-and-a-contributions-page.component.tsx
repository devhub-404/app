import { createSignal, onMount } from 'solid-js';
import { listMyAnswers, listMyQAndAContributions } from '@/features/q-and-a/public';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/account/i18n';
import QAndAContributionsPanel, { type QAndAContributionViewItem } from './q-and-a-contributions-panel.component.tsx';

type Props = { kind: 'question' | 'answer' };

function QAndAContributionsPage(props: Props) {
  const [items, setItems] = createSignal<QAndAContributionViewItem[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(false);
  const question = () => props.kind === 'question';
  const { t } = useI18n();

  onMount(async () => {
    try {
      if (question()) {
        const result = await listMyQAndAContributions();
        setItems(
          (result.data?.data ?? [])
            .filter((item) => item.type === 'question')
            .map((item) => ({
              id: item.id,
              title: item.title,
              occurredAt: item.occurredAt,
              hiddenAt: typeof item.hiddenAt === 'string' || item.hiddenAt instanceof Date ? item.hiddenAt : null,
              href: `/questions/${encodeURIComponent(item.id)}`,
            })),
        );
        setError(Boolean(result.error));
      } else {
        const result = await listMyAnswers();
        setItems(
          (result.data?.data ?? []).map((item) => ({
            id: item.id,
            title: item.content.length > 120 ? `${item.content.slice(0, 117)}…` : item.content,
            occurredAt: item.createdAt,
            hiddenAt: typeof item.hiddenAt === 'string' || item.hiddenAt instanceof Date ? item.hiddenAt : null,
            href: `/questions/${encodeURIComponent(item.questionId)}#answer-${encodeURIComponent(item.id)}`,
          })),
        );
        setError(Boolean(result.error));
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  });

  return (
    <QAndAContributionsPanel
      title={question() ? t('myqanda.questions') : t('myqanda.answers')}
      singularTitle={question() ? t('myqanda.question') : t('myqanda.answer')}
      items={items()}
      loading={loading()}
      error={error()}
    />
  );
}

export default withLocale(QAndAContributionsPage);
