type FeedItem = {
  title: string;
  slug: string;
  description?: string | null;
  publishedAt: string | null;
  updatedAt: string;
};

type FeedPage = {
  items: FeedItem[];
  error?: { code?: string } | null;
};

const PAGE_SIZE = 100;

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function fetchAll(loadPage: (page: number, pageSize: number) => Promise<FeedPage>): Promise<FeedItem[]> {
  const items: FeedItem[] = [];
  let page = 1;

  while (true) {
    const result = await loadPage(page, PAGE_SIZE);
    if (result.error) {
      throw new Error(`RSS source query failed: ${result.error.code ?? 'REQUEST_FAILED'}`);
    }

    items.push(...result.items.filter((item) => item.publishedAt));
    if (result.items.length < PAGE_SIZE) break;
    page += 1;
  }

  return items;
}

export async function renderRssFeed(options: {
  path: 'articles' | 'news';
  title: string;
  description: string;
  itemPath: 'articles' | 'news';
  origin: string;
  loadPage: (page: number, pageSize: number) => Promise<FeedPage>;
}): Promise<string> {
  const items = await fetchAll(options.loadPage);
  const feedUrl = new URL(`/rss/${options.path}.xml`, options.origin).toString();
  const latestUpdate = items.reduce((latest, item) => Math.max(latest, Date.parse(item.updatedAt)), 0);

  const entries = items
    .filter((item) => item.publishedAt)
    .map((item) => {
      const link = new URL(`/${options.itemPath}/${encodeURIComponent(item.slug)}`, options.origin).toString();
      return `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(item.description ?? '')}</description>
      <pubDate>${new Date(item.publishedAt as string).toUTCString()}</pubDate>
    </item>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(options.title)}</title>
    <link>${escapeXml(options.origin)}</link>
    <description>${escapeXml(options.description)}</description>
    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    ${latestUpdate ? `<lastBuildDate>${new Date(latestUpdate).toUTCString()}</lastBuildDate>` : ''}${entries}
  </channel>
</rss>`;
}
