import { describe, expect, it } from 'vitest';
import { ExternalResource, ExternalResourceStatus } from '@/modules/external-resource/domain/external-resource';
import {
  ExternalResourceSuggestion,
  ExternalResourceSuggestionStatus,
} from '@/modules/external-resource/domain/external-resource-suggestion';

const input = {
  title: 'Useful documentation',
  description: 'A curated reference for developers.',
  url: 'https://example.com/docs/#section',
  tagSlugs: ['typescript', 'typescript', ''],
};

describe('ExternalResource domain', () => {
  it('stores canonical URL in url and unique tags', () => {
    const resource = ExternalResource.create('resource-1', input);
    expect(resource.status).toBe(ExternalResourceStatus.Active);
    expect(resource.url).toBe('https://example.com/docs');
    expect(resource.tagSlugs).toEqual(['typescript']);
  });
  it('owns archive/unarchive/delete lifecycle', () => {
    const resource = ExternalResource.create('resource-1', input);
    resource.archive();
    expect(resource.status).toBe(ExternalResourceStatus.Archived);
    resource.unarchive();
    resource.softDelete();
    expect(resource.deletedAt).not.toBeNull();
  });
});

describe('ExternalResourceSuggestion domain', () => {
  it('is an auditable URL proposal independent from the resulting Resource', () => {
    const suggestion = ExternalResourceSuggestion.create('suggestion-1', {
      url: 'https://example.com/docs/#x',
      submittedByAccountId: 'account-1',
    });
    expect(suggestion.url).toBe('https://example.com/docs');
    expect(suggestion.status).toBe(ExternalResourceSuggestionStatus.Pending);
    expect(suggestion.acceptedExternalResourceId).toBeNull();
    suggestion.approve('resource-1', 'curator-1');
    expect(suggestion.status).toBe(ExternalResourceSuggestionStatus.Accepted);
    expect(suggestion.acceptedExternalResourceId).toBe('resource-1');
  });
});

describe('ExternalResource persistence semantics', () => {
  it('RES-RN-007 — preserves Suggestion after submitter purge by allowing anonymized rehydration', () => {
    const suggestion = ExternalResourceSuggestion.rehydrate({
      id: 'suggestion-1',
      acceptedExternalResourceId: null,
      submittedByAccountId: null,
      url: 'https://example.com/docs',
      status: 'pending',
      decisionNote: null,
      decidedByAccountId: null,
      decidedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(suggestion.submittedByAccountId).toBeNull();
    expect(suggestion.status).toBe(ExternalResourceSuggestionStatus.Pending);
  });
});
