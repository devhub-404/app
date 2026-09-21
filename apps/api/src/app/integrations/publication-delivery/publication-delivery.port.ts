import type { ContentPublishedMessage } from '@/shared/kernel/events/published-content';

export abstract class PublicationDeliveryPort {
  abstract tryPublish(message: ContentPublishedMessage): Promise<void>;
}
