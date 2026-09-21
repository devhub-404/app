import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const contentRoot = '../../../content';

const cheatsheets = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: `${contentRoot}/cheatsheets`,
    generateId: ({ data }) => `${String(data['slug'])}/${String(data['locale'])}`,
  }),
  schema: z.object({
    locale: z.enum(['en', 'pt', 'es']),
    title: z.string(),
    description: z.string(),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    topic: z.string().optional(),
    tags: z.array(z.string()).default([]),
    status: z.enum(['draft', 'published', 'archived']).default('published'),
  }),
});
const roadmaps = defineCollection({
  loader: glob({
    pattern: '**/roadmap.json',
    base: `${contentRoot}/roadmaps`,
    generateId: ({ data }) => `${String(data['slug'])}/${String(data['locale'])}`,
  }),
  schema: z.object({
    locale: z.enum(['en', 'pt', 'es']),
    title: z.string(),
    description: z.string(),
    status: z.enum(['draft', 'published', 'archived']).default('published'),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    metadata: z.object({ tags: z.array(z.string()).default([]) }),
    sections: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          order: z.number().int().default(0),
          topics: z
            .array(
              z.object({
                id: z.string(),
                title: z.string(),
                order: z.number().int().default(0),
                references: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
              }),
            )
            .min(1),
        }),
      )
      .min(1),
  }),
});
const roadmapTopics = defineCollection({
  loader: glob({ pattern: '**/sections/**/*.md', base: `${contentRoot}/roadmaps` }),
  schema: z.object({}),
});
const codex = defineCollection({
  loader: glob({
    pattern: '**/codex.json',
    base: `${contentRoot}/codex`,
    generateId: ({ data }) => `${String(data['slug'])}/${String(data['locale'])}`,
  }),
  schema: z.object({
    locale: z.enum(['en', 'pt', 'es']),
    title: z.string(),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    description: z.string(),
    status: z.enum(['draft', 'published', 'archived']).default('published'),
    tags: z.array(z.string()).default([]),
    branding: z.object({
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      logo: z.string().min(1),
    }),
    links: z.object({ official: z.url(), repository: z.url() }),
    metadata: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  }),
});
export const collections = { cheatsheets, roadmaps, roadmapTopics, codex };
