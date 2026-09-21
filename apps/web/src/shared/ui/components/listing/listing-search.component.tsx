import { useI18n } from '@/shared/i18n';
import { Search } from 'lucide-solid';

type Props = { query: string; placeholder: string; onChange: (query: string) => void };

function ListingSearch(props: Props) {
  const { t } = useI18n();
  return (
    <label class="grid gap-1 text-xs font-semibold text-content-muted">
      <span class="sr-only">{t('listing.search')}</span>
      <span class="relative">
        <Search
          class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-muted"
          aria-hidden="true"
        />
        <input
          name="q"
          value={props.query}
          placeholder={props.placeholder}
          onInput={(event) => props.onChange(event.currentTarget.value)}
          class="field-control min-h-10 w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm font-normal text-content"
        />
      </span>
    </label>
  );
}

export default ListingSearch;
