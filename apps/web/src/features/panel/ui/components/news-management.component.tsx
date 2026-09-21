import { Tabs } from '@ark-ui/solid/tabs';
import NewsAdminList from '@/features/panel/ui/components/news-admin-list.component.tsx';
import NewsSourcesAdminList from '@/features/panel/ui/components/news-sources-admin-list.component.tsx';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/panel/i18n';

function NewsManagement() {
  const { t } = useI18n();
  return (
    <Tabs.Root defaultValue="news" class="grid gap-5">
      <Tabs.List
        aria-label={t('panelnewsworkspace.sectionsNews')}
        class="flex w-full overflow-x-auto border-b border-line"
      >
        <Tabs.Trigger
          value="news"
          class="mr-6 rounded-sm border-b-2 border-transparent px-1 pb-3 text-sm font-semibold text-content-muted outline-none transition duration-standard ease-standard hover:text-content focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas data-[state=active]:border-action-border data-[state=active]:text-content"
        >
          {t('newsadminlist.news')}
        </Tabs.Trigger>
        <Tabs.Trigger
          value="sources"
          class="rounded-sm border-b-2 border-transparent px-1 pb-3 text-sm font-semibold text-content-muted outline-none transition duration-standard ease-standard hover:text-content focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas data-[state=active]:border-action-border data-[state=active]:text-content"
        >
          {t('newssourcesadminlist.sources')}
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="news">
        <NewsAdminList />
      </Tabs.Content>
      <Tabs.Content value="sources">
        <NewsSourcesAdminList />
      </Tabs.Content>
    </Tabs.Root>
  );
}

export default withLocale(NewsManagement);
