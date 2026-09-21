import { For } from 'solid-js';
import { ExternalLink } from 'lucide-solid';
import type { ToolDefinition } from '../../domain/tool-catalog.domain.ts';
import TagLink from '@/shared/ui/components/navigation/tag-link.component.tsx';
import { useI18n } from '../../i18n';

export default function ToolCard(props: { item: ToolDefinition }) {
  const { t } = useI18n();
  return (
    <article class="flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition duration-standard ease-standard hover:-translate-y-0.5 hover:border-action-border">
      <div class="flex items-start justify-between gap-4">
        <h2 class="heading-card text-lg">
          {t(props.item.titleKey)}
        </h2>
        <span class="rounded-full border border-line px-2 py-1 text-[10px] font-semibold uppercase tracking-[.16em] text-content-muted">
          {t('tools.location')}
        </span>
      </div>
      <p class="text-muted mt-2">
        {t(props.item.descriptionKey)}
      </p>
      <div class="mt-4 flex flex-wrap gap-2">
        <For each={props.item.tags}>{(tag) => <TagLink slug={tag} />}</For>
      </div>
      <div class="mt-auto flex justify-end pt-6">
        <a
          href={`/tools/${props.item.slug}`}
          title={t('tools.openToolValue0', [t(props.item.titleKey)])}
          aria-label={t('tools.openToolValue0', [t(props.item.titleKey)])}
          class="inline-flex size-9 items-center justify-center rounded-full border border-line text-content transition duration-standard ease-standard hover:border-action-border hover:text-content-accent active:scale-[.98]"
        >
          <ExternalLink class="size-4" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
