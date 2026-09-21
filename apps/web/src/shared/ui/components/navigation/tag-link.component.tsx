import { routes } from '@/shared/navigation/routes';

import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/shared/i18n';
type Props = { slug: string; label?: string; class?: string };

function TagLink(props: Props) {
  const { t } = useI18n();
  return (
    <a
      href={routes.searchByTag(props.slug)}
      class={
        props.class ??
        'inline-flex rounded-full border border-line px-2.5 py-1 text-xs font-medium text-content-muted transition duration-standard ease-standard hover:border-action-border hover:bg-action-subtle hover:text-content-accent active:bg-action-muted'
      }
      aria-label={t('taglink.searchContentTagValue0', [props.slug])}
      title={t('tag.searchTitle', [props.slug])}
    >
      #{props.label ?? props.slug}
    </a>
  );
}

export default withLocale(TagLink);
