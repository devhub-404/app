import { describe, expect, it } from 'vitest';
import { ProjectAccessService } from '@/modules/project/application/policies/project-access.service';

const project = { authorAccountId: 'author-1' } as never;

describe('ProjectAccessService', () => {
  it('allows the project author to manage the project', () => {
    expect(() => new ProjectAccessService().assertCanManage('author-1', project)).not.toThrow();
  });

  it('hides a project from non-authors', () => {
    expect(() => new ProjectAccessService().assertCanManage('account-2', project)).toThrowError(
      expect.objectContaining({ code: 'CONTENT_NOT_FOUND' }),
    );
  });
});
