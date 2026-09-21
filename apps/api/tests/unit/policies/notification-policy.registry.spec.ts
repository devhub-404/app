import { describe, expect, it, vi } from 'vitest';
import { NotificationPolicyRegistry } from '@/modules/notification/application/policies/notification-policy.registry';

describe('NotificationPolicyRegistry', () => {
  it('registers and resolves a policy by event name', () => {
    const registry = new NotificationPolicyRegistry();
    const policy = vi.fn();

    registry.register('article.published', policy);

    expect(registry.resolve('article.published')).toBe(policy);
    expect(registry.resolve('article.archived')).toBeUndefined();
  });

  it('rejects blank and duplicate event names', () => {
    const registry = new NotificationPolicyRegistry();

    expect(() => registry.register('   ', vi.fn())).toThrow('NOTIFICATION_POLICY_EVENT_REQUIRED');
    registry.register('article.published', vi.fn());
    expect(() => registry.register('article.published', vi.fn())).toThrow('NOTIFICATION_POLICY_ALREADY_REGISTERED');
  });
});
