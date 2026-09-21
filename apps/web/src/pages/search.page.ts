import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { searchEndpointSchema } from '@/features/home/ui/schemas/search.schema.ts';
import { searchDiscovery, type DiscoveryItem } from '@/features/discovery/public';
import { selectLocalizedEntries } from '@/shared/content/localized-entries';
import type { Locale } from '@/shared/i18n/core';

const ALL_DOMAINS = [
  'articles',
  'codex',
  'cheatsheets',
  'roadmaps',
  'questions',
  'resources',
  'tools',
  'projects',
  'events',
  'jobs',
  'news',
] as const;
const SITE_URL = 'https://devhub404.org';

type Domain = (typeof ALL_DOMAINS)[number];

type SearchResult = {
  id: string;
  domain: Domain;
  title: string;
  description: string;
  excerpt: string;
  url: string;
  language?: string;
  tags: string[];
  publishedAt?: string;
  relevance?: number;
};

const dynamicTypes: Record<string, DiscoveryItem['type']> = {
  articles: 'article',
  news: 'news',
  resources: 'resource',
  questions: 'question',
  projects: 'project',
  jobs: 'job',
  events: 'event',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60' },
  });
}

function domainsFrom(url: URL): Domain[] {
  const requested = url.searchParams
    .get('domains')
    ?.split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  if (!requested?.length) return [...ALL_DOMAINS];
  return [...new Set(requested)].filter((domain): domain is Domain =>
    (ALL_DOMAINS as readonly string[]).includes(domain),
  );
}

function matches(value: string, query: string): boolean {
  const haystack = value.toLocaleLowerCase();
  return query.split(/\s+/).every((term) => haystack.includes(term));
}

function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

async function staticResults(query: string, domains: Domain[], locale: Locale): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  if (domains.includes('codex')) {
    for (const entry of selectLocalizedEntries(
      await getCollection('codex', ({ data }) => data.status === 'published'),
      locale,
    )) {
      const { data } = entry;
      const text = `${data.title} ${data.description} ${data.tags.join(' ')}`;
      if (matches(text, query))
        results.push({
          id: entry.id,
          domain: 'codex',
          title: data.title,
          description: data.description,
          excerpt: data.description,
          url: absoluteUrl(`/codex/${encodeURIComponent(data.slug)}`),
          language: data.locale,
          tags: data.tags,
        });
    }
  }

  if (domains.includes('cheatsheets')) {
    for (const entry of selectLocalizedEntries(
      await getCollection('cheatsheets', ({ data }) => data.status === 'published'),
      locale,
    )) {
      const { data } = entry;
      const body = 'body' in entry && typeof entry.body === 'string' ? entry.body : '';
      const text = `${data.title} ${data.description} ${data.topic ?? ''} ${data.tags.join(' ')} ${body}`;
      if (matches(text, query))
        results.push({
          id: entry.id,
          domain: 'cheatsheets',
          title: data.title,
          description: data.description,
          excerpt: data.description,
          url: absoluteUrl(`/cheatsheets/${data.slug}`),
          language: data.locale,
          tags: data.tags,
        });
    }
  }

  if (domains.includes('roadmaps')) {
    for (const entry of selectLocalizedEntries(
      await getCollection('roadmaps', ({ data }) => data.status === 'published'),
      locale,
    )) {
      const { data } = entry;
      const tags = data.metadata.tags;
      const topics = data.sections
        .flatMap((section) => [section.title, ...section.topics.map((topic) => topic.title)])
        .join(' ');
      const text = `${data.title} ${data.description} ${topics} ${tags.join(' ')}`;
      if (matches(text, query))
        results.push({
          id: entry.id,
          domain: 'roadmaps',
          title: data.title,
          description: data.description,
          excerpt: data.description,
          url: absoluteUrl(`/roadmaps/${encodeURIComponent(data.slug)}`),
          language: data.locale,
          tags,
        });
    }
  }

  return results;
}

function dynamicUrl(item: DiscoveryItem): string {
  const paths: Record<DiscoveryItem['type'], string> = {
    article: 'articles',
    news: 'news',
    resource: 'resources',
    question: 'questions',
    project: 'projects',
    job: 'jobs',
    event: 'events',
  };
  return absoluteUrl(`/${paths[item.type]}/${encodeURIComponent(item.slug || item.id)}`);
}

export const GET: APIRoute = async ({ url, locals }) => {
  const request = searchEndpointSchema.safeParse({
    q: url.searchParams.get('q') ?? '',
    limit: url.searchParams.get('limit') ?? 10,
  });
  if (!request.success) return json({ error: 'q must contain at least 2 characters' }, 400);
  const query = request.data.q;
  if (query.length < 2) return json({ error: 'q must contain at least 2 characters' }, 400);

  const domains = domainsFrom(url);
  const limit = request.data.limit;
  const results = await staticResults(query.toLocaleLowerCase(), domains, locals.locale);
  const backendTypes = domains
    .filter((domain) => dynamicTypes[domain])
    .map((domain) => dynamicTypes[domain])
    .join(',');

  if (backendTypes) {
    const page = await searchDiscovery({ search: query, types: backendTypes, page: 1, pageSize: limit }, locals.api);
    for (const item of page?.items ?? []) {
      results.push({
        id: item.id,
        domain: Object.entries(dynamicTypes).find(([, type]) => type === item.type)?.[0] as Domain,
        title: item.title,
        description: item.summary,
        excerpt: item.summary,
        url: dynamicUrl(item),
        publishedAt: item.publishedAt?.toString(),
        tags: [],
        relevance: item.relevanceScore,
      });
    }
  }

  return json({ query, domains, results: results.slice(0, limit) });
};
