export type ToolDefinition = {
  slug: string;
  titleKey: 'tool.jsonFormatter.title' | 'tool.base64Encoder.title';
  descriptionKey: 'tool.jsonFormatter.description' | 'tool.base64Encoder.description';
  tags: string[];
  kind: 'json' | 'base64';
};

export const tools: ToolDefinition[] = [
  {
    slug: 'json-format',
    titleKey: 'tool.jsonFormatter.title',
    descriptionKey: 'tool.jsonFormatter.description',
    tags: ['json', 'formatting', 'debug'],
    kind: 'json',
  },
  {
    slug: 'base64',
    titleKey: 'tool.base64Encoder.title',
    descriptionKey: 'tool.base64Encoder.description',
    tags: ['base64', 'encoding', 'text'],
    kind: 'base64',
  },
];

export const getTool = (slug: string) => tools.find((tool) => tool.slug === slug);
