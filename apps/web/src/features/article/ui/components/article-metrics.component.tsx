import { useI18n } from '@/features/article/i18n';
import { Clock3, Eye, MessageCircle, ThumbsUp } from 'lucide-solid';
interface Props {
  heading: string;
  readingTimeMinutes: number;
  views: number;
  votes: number;
  commentCount: number;
}

export default function ArticleMetrics(props: Props) {
  const { t } = useI18n();
  return (
    <section class="rounded-2xl border border-line bg-surface p-5">
      <h2 class="heading-tiny text-xs">
        {props.heading}
      </h2>
      <dl class="mt-4 space-y-3 text-sm">
        <div class="flex justify-between">
          <dt class="inline-flex items-center gap-1 text-xs text-content-muted">
            <Clock3 class="size-3.5" /> {t('articledetail.reading')}
          </dt>
          <dd>
            {props.readingTimeMinutes} {t('articledetail.min')}
          </dd>
        </div>
        <div class="flex justify-between">
          <dt class="inline-flex items-center gap-1 text-xs text-content-muted">
            <Eye class="size-3.5" /> {t('articledetail.views')}
          </dt>
          <dd>{props.views}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="inline-flex items-center gap-1 text-xs text-content-muted">
            <ThumbsUp class="size-3.5" aria-hidden="true" /> {t('articledetail.votes')}
          </dt>
          <dd>{props.votes}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="inline-flex items-center gap-1 text-xs text-content-muted">
            <MessageCircle class="size-3.5" aria-hidden="true" /> {t('articledetail.comments')}
          </dt>
          <dd>{props.commentCount}</dd>
        </div>
      </dl>
    </section>
  );
}
