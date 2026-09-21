import { describe, expect, it } from 'vitest';
import { Feedback } from '@/modules/feedback/domain';

describe('Feedback domain', () => {
  const input = {
    id: 'feedback-1',
    reporterAccountId: 'account-1',
    category: 'issue' as const,
    description: 'Falha reproduzível no fluxo de autenticação.',
    contextUrl: 'https://devhub.test/login',
    screenshotMediaId: 'media-1',
  };

  it('FDB-RN-001/FDB-RN-002/FDB-RN-003 — creates valid feedback with informational context and optional media reference', () => {
    const feedback = Feedback.create(input, new Date('2026-01-01T00:00:00.000Z'));
    expect(feedback.value).toMatchObject({
      ...input,
      status: 'open',
      internalSeverity: null,
      resolvedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('FDB-RN-001 — requires a reporter, meaningful description and public category', () => {
    expect(() => Feedback.create({ ...input, reporterAccountId: '' })).toThrow('FEEDBACK_INVALID_SUBMISSION');
    expect(() => Feedback.create({ ...input, description: '   ' })).toThrow('FEEDBACK_INVALID_SUBMISSION');
    expect(() => Feedback.create({ ...input, category: 'abuse' as never })).toThrow('FEEDBACK_INVALID_SUBMISSION');
  });

  it('FDB-RN-005 — follows OPEN → IN_REVIEW → RESOLVED and records resolvedAt', () => {
    const feedback = Feedback.create(input);
    feedback.startReview();
    expect(feedback.value.status).toBe('in_review');
    feedback.resolve(new Date('2026-01-02T00:00:00.000Z'));
    expect(feedback.value).toMatchObject({
      status: 'resolved',
      resolvedAt: '2026-01-02T00:00:00.000Z',
    });
    expect(() => feedback.startReview()).toThrow('FEEDBACK_INVALID_STATUS');
    expect(() => feedback.dismiss()).toThrow('FEEDBACK_INVALID_STATUS');
  });

  it('FDB-RN-005 — allows dismissal from triage and prevents terminal transitions', () => {
    const feedback = Feedback.create(input);
    feedback.startReview();
    feedback.dismiss(new Date('2026-01-02T00:00:00.000Z'));
    expect(feedback.value).toMatchObject({ status: 'dismissed', resolvedAt: '2026-01-02T00:00:00.000Z' });
    expect(() => feedback.resolve()).toThrow('FEEDBACK_INVALID_STATUS');
  });

  it('FDB-RN-004/FDB-RF-005 — classifies non-terminal feedback internally without changing its public category', () => {
    const feedback = Feedback.create(input);
    feedback.classify('high');
    expect(feedback.value).toMatchObject({ internalSeverity: 'high', category: 'issue', status: 'open' });
    feedback.startReview();
    feedback.classify(null);
    expect(feedback.value.internalSeverity).toBeNull();
  });
});
