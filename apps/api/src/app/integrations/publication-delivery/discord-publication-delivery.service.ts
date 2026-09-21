import { Injectable, Logger } from '@nestjs/common';
import { env } from '@/app/config/env';
import type { ContentPublishedMessage, PublishedContent } from '@/shared/kernel/events/published-content';
import { PublicationDeliveryPort } from './publication-delivery.port';

const DELIVERY_TIMEOUT_MS = 5_000;

function contentFrom(message: ContentPublishedMessage): PublishedContent | null {
  return message.event === 'article_published' ? (message.data.article ?? null) : (message.data.news ?? null);
}

export function discordPayload(message: ContentPublishedMessage, siteUrl: string): Record<string, unknown> | null {
  const content = contentFrom(message);
  if (!content) return null;

  const section = message.event === 'article_published' ? 'articles' : 'news';
  const url = `${siteUrl.replace(/\/+$/, '')}/${section}/${encodeURIComponent(content.slug)}`;
  const tags = content.tags.map((tag) => `\`${tag}\``).join(' ');

  return {
    username: 'DevHub 404',
    embeds: [
      {
        title: content.title,
        description: content.title,
        url,
        color: message.event === 'article_published' ? 0x6366f1 : 0x0ea5e9,
        timestamp: content.publishedAt,
        ...(content.coverImageUrl ? { image: { url: content.coverImageUrl } } : {}),
        ...(tags ? { fields: [{ name: 'Tags', value: tags }] } : {}),
        footer: { text: message.event === 'article_published' ? 'DevHub 404 · Artigos' : 'DevHub 404 · Notícias' },
      },
    ],
  };
}

export async function sendDiscordPublication(
  message: ContentPublishedMessage,
  webhookUrl: string,
  siteUrl: string,
  fetcher: typeof fetch = fetch,
): Promise<void> {
  const payload = discordPayload(message, siteUrl);
  if (!payload) return;

  const response = await fetcher(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`status=${response.status}`);
}

@Injectable()
export class DiscordPublicationDeliveryService extends PublicationDeliveryPort {
  private readonly logger = new Logger(DiscordPublicationDeliveryService.name);

  async tryPublish(message: ContentPublishedMessage): Promise<void> {
    const webhookUrl = env.discord.webhookUrl;
    if (!webhookUrl) return;

    try {
      await sendDiscordPublication(message, webhookUrl, env.siteUrl);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown error';
      this.logger.warn(
        `Discord publication delivery failed: event=${message.event} eventId=${message.id} reason=${reason}`,
      );
    }
  }
}
