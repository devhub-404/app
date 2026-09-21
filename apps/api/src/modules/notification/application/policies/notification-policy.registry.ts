import { Injectable } from '@nestjs/common';
import type { CreateNotificationInput } from '@/modules/notification/public/notification-public.service';

/**
 * Registry for explicit owner-event notification policies.
 * Policies are registered by composition roots; the registry itself does not
 * infer recipients or subscribe to arbitrary events.
 */
export type NotificationPolicy = (
  event: unknown,
) =>
  | CreateNotificationInput
  | CreateNotificationInput[]
  | null
  | Promise<CreateNotificationInput | CreateNotificationInput[] | null>;

@Injectable()
export class NotificationPolicyRegistry {
  private readonly policies = new Map<string, NotificationPolicy>();

  register(eventName: string, policy: NotificationPolicy): void {
    if (!eventName.trim()) throw new Error('NOTIFICATION_POLICY_EVENT_REQUIRED');
    if (this.policies.has(eventName)) throw new Error('NOTIFICATION_POLICY_ALREADY_REGISTERED');
    this.policies.set(eventName, policy);
  }

  resolve(eventName: string): NotificationPolicy | undefined {
    return this.policies.get(eventName);
  }
}
