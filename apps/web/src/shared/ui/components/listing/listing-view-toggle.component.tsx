import ToggleButton from '@/shared/ui/components/actions/toggle-button.component.tsx';
import { useI18n } from '@/shared/i18n';
import { Grid2x2, List } from 'lucide-solid';

type ListingView = 'grid' | 'list';
type Props = { view: ListingView; onChange: (view: ListingView) => void };

function ListingViewToggle(props: Props) {
  const { t } = useI18n();

  return (
    <nav
      class="inline-flex items-center gap-0.5 rounded-xl border border-line/80 bg-surface-subtle p-1"
      aria-label={t('listing.view')}
    >
      <ToggleButton
        type="button"
        aria-label={t('listing.grid')}
        pressed={props.view === 'grid'}
        size="sm"
        class="!border-0 !bg-transparent aria-pressed:!border-0 aria-pressed:!bg-action-muted hover:!border-0 hover:!bg-surface-subtle"
        onClick={() => props.onChange('grid')}
      >
        <Grid2x2 class="size-4" aria-hidden="true" />
      </ToggleButton>
      <ToggleButton
        type="button"
        aria-label={t('listing.list')}
        pressed={props.view === 'list'}
        size="sm"
        class="!border-0 !bg-transparent aria-pressed:!border-0 aria-pressed:!bg-action-muted hover:!border-0 hover:!bg-surface-subtle"
        onClick={() => props.onChange('list')}
      >
        <List class="size-4" aria-hidden="true" />
      </ToggleButton>
    </nav>
  );
}

export default ListingViewToggle;
