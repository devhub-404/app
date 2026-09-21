import assert from 'node:assert/strict';
import { test } from 'vitest';
import { canAccessRoute, requiresRouteAuthentication, routeAccess } from '../../../src/app/access/route.access.ts';
import { anonymousActor, isAdmin, isCurator, isModerator, type Actor } from '../../../src/features/auth/access/actor.access.ts';
import { requiresAuthentication } from '../../../src/features/auth/access/route.access.ts';
import {
  canArchiveArticle,
  canDeleteArticle,
  canEditArticle,
  canPublishArticle,
  canUnarchiveArticle,
  isArticleAuthor,
} from '../../../src/features/article/access/article.access.ts';
import {
  isArticleArchivable,
  isArticlePublishable,
  isArticleUnarchivable,
} from '../../../src/features/article/domain/article.domain.ts';
import {
  canDeleteEvent,
  canEditEvent,
  canReviewEventSuggestions,
  canViewEventManagement,
} from '../../../src/features/event/access/event.access.ts';
import { canAccessNewsEditorialPath } from '../../../src/features/news/access/route.access.ts';
import {
  canArchiveNews,
  canDeleteNews,
  canEditNews,
  canPublishNews,
  canUnarchiveNews,
} from '../../../src/features/news/access/news.access.ts';
import {
  isNewsArchivable,
  isNewsPublic,
  isNewsPublishable,
  isNewsUnarchivable,
} from '../../../src/features/news/domain/news.domain.ts';
import {
  canCloseJob,
  canDeleteJob,
  canEditJob,
  canModerateJob,
  canRenewJob,
  canWithdrawJob,
} from '../../../src/features/job/access/job.access.ts';
import {
  isJobClosable,
  isJobEditable,
  isJobRenewable,
  isJobWithdrawable,
} from '../../../src/features/job/domain/job.domain.ts';
import {
  canManageOrganization,
  canArchiveOrganization,
  canDeleteOrganization,
  canEditOrganization,
  canManageOrganizationMemberships,
  canUnarchiveOrganization,
} from '../../../src/features/organization/access/organization.access.ts';
import { hasAnotherOwner, isOrganizationActive } from '../../../src/features/organization/domain/organization.domain.ts';
import {
  canBanAccount,
  canSuspendAccount,
  canUnbanAccount,
  canUnsuspendAccount,
} from '../../../src/features/panel/access/account-moderation.access.ts';
import {
  isAccountBannable,
  isAccountSuspendable,
  isAccountUnbannable,
  isAccountUnsuspendable,
} from '../../../src/features/panel/domain/account-moderation.domain.ts';
import {
  canAccessPanelCapability,
  canAccessPanelPath,
  panelAccess,
  panelCapabilityForPath,
} from '../../../src/features/panel/access/panel.access.ts';
import {
  canArchiveProject,
  canDeleteProject,
  canEditProject,
  canPublishProject,
  canUnarchiveProject,
  isProjectAuthor,
} from '../../../src/features/project/access/project.access.ts';
import {
  isProjectArchivable,
  isProjectPublic,
  isProjectPublishable,
  isProjectUnarchivable,
} from '../../../src/features/project/domain/project.domain.ts';
import {
  canAcceptQuestionAnswer,
  canCloseQuestion,
  canDeleteQuestion,
  canDeleteQuestionAnswer,
  canHideQuestion,
  canModerateQuestion,
  canReopenQuestion,
  canSubmitQuestionAnswer,
  canUnhideQuestion,
  isAnswerAuthor,
  isQuestionAuthor,
  isQuestionModerator,
} from '../../../src/features/q-and-a/access/question.access.ts';
import {
  isQuestionAnswerable,
  isQuestionClosable,
  isQuestionHideable,
  isQuestionReopenable,
  isQuestionSolved,
  isQuestionUnhideable,
} from '../../../src/features/q-and-a/domain/question.domain.ts';
import { canAccessResourceEditorialPath } from '../../../src/features/resource/access/route.access.ts';
import {
  canArchiveResource,
  canDeleteResource,
  canManageResources,
  canUnarchiveResource,
} from '../../../src/features/resource/access/resource.access.ts';
import { isResourceArchivable, isResourceUnarchivable } from '../../../src/features/resource/domain/resource.domain.ts';

const actor = (
  accountId: string | null,
  role: Actor['role'],
  organizationIds: string[] = [],
  ownerOrganizationIds: string[] = [],
): Actor => ({
  accountId,
  role,
  organizationIds,
  ownerOrganizationIds,
});

test('actor predicates do not treat anonymous or adjacent roles as equivalent', () => {
  assert.equal(anonymousActor.accountId, null);
  assert.equal(isCurator(actor('1', 'curator')), true);
  assert.equal(isCurator(actor('1', 'admin')), false);
  assert.equal(isModerator(actor('1', 'moderator')), true);
  assert.equal(isModerator(actor('1', 'admin')), false);
  assert.equal(isAdmin(actor('1', 'admin')), true);
  assert.equal(isAdmin(actor('1', 'moderator')), false);
});

test('application route access composes authentication and role policies once', () => {
  const publicAccess = routeAccess('/articles/example');
  assert.equal(publicAccess.kind, 'public');
  assert.equal(requiresRouteAuthentication(publicAccess), false);
  assert.equal(canAccessRoute(publicAccess, undefined), true);

  const accountAccess = routeAccess('/account/preferences');
  assert.equal(accountAccess.kind, 'authenticated');
  assert.equal(requiresRouteAuthentication(accountAccess), true);
  assert.equal(canAccessRoute(accountAccess, null), true);
  assert.equal(canAccessRoute(accountAccess, undefined), false);

  const newsAccess = routeAccess('/news/new');
  assert.deepEqual(newsAccess, { kind: 'roles', roles: ['curator', 'admin'] });
  assert.equal(canAccessRoute(newsAccess, 'curator'), true);
  assert.equal(canAccessRoute(newsAccess, 'moderator'), false);

  const resourceAccess = routeAccess('/resources/example/edit/');
  assert.deepEqual(resourceAccess, { kind: 'roles', roles: ['curator', 'admin'] });

  const panelRouteAccess = routeAccess('/panel/users/123');
  assert.deepEqual(panelRouteAccess, { kind: 'roles', roles: ['admin'] });
  assert.equal(canAccessRoute(panelRouteAccess, 'admin'), true);
  assert.equal(canAccessRoute(panelRouteAccess, 'moderator'), false);

  const unknownPanelAccess = routeAccess('/panel/unknown');
  assert.deepEqual(unknownPanelAccess, { kind: 'roles', roles: [] });
  assert.equal(canAccessRoute(unknownPanelAccess, 'admin'), false);
});

test('authentication and editorial route guards cover exact, nested and trailing-slash forms', () => {
  for (const path of ['/account', '/account/preferences', '/account/', '/panel', '/panel/users/']) {
    assert.equal(requiresAuthentication(path), true, path);
  }
  for (const path of [
    '/articles/new',
    '/articles/new/',
    '/news/new/',
    '/questions/new/',
    '/projects/new/',
    '/jobs/new/',
    '/events/new/',
    '/resources/new/',
    '/organizations/new/',
  ]) {
    assert.equal(requiresAuthentication(path), true, path);
  }
  for (const path of ['/articles/a/edit/', '/news/a/edit/', '/resources/a/edit/', '/organizations/a/settings/']) {
    assert.equal(requiresAuthentication(path), true, path);
  }
  for (const path of ['/about', '/accounting', '/panelist', '/articles/a']) {
    assert.equal(requiresAuthentication(path), false, path);
  }
  assert.equal(canAccessNewsEditorialPath('/news/new/', 'curator'), true);
  assert.equal(canAccessNewsEditorialPath('/news/new/', 'member'), false);
  assert.equal(canAccessResourceEditorialPath('/resources/new/', 'curator'), true);
  assert.equal(canAccessResourceEditorialPath('/resources/new/', 'member'), false);
});

test('route access keeps public resources open and protects every mutation entry point', () => {
  for (const path of [
    '/articles/example',
    '/news/example',
    '/questions/1',
    '/projects/example',
    '/jobs/1',
    '/events/example',
    '/organizations/example',
    '/tools/example',
  ]) {
    assert.equal(routeAccess(path).kind, 'public', path);
  }

  for (const path of [
    '/articles/new',
    '/articles/example/edit',
    '/questions/new',
    '/projects/new',
    '/jobs/new',
    '/events/new',
    '/organizations/new',
    '/organizations/example/settings',
    '/account/preferences',
  ]) {
    assert.notEqual(routeAccess(path).kind, 'public', path);
    assert.equal(canAccessRoute(routeAccess(path), undefined), false, path);
  }
});

test('panel capability matrix is closed over the declared roles and route prefixes', () => {
  const roles = [null, 'curator', 'moderator', 'admin', 'member'];
  for (const [capability, allowedRoles] of Object.entries(panelAccess)) {
    for (const role of roles) {
      assert.equal(
        canAccessPanelCapability(role, capability as keyof typeof panelAccess),
        role === 'admin' || allowedRoles.includes(role as never),
        `${capability}:${role}`,
      );
    }
  }
  assert.equal(canAccessPanelPath('/panel', 'curator'), true);
  assert.equal(canAccessPanelPath('/panel/users/123', 'admin'), true);
  assert.equal(canAccessPanelPath('/panel/users/123', 'moderator'), false);
  assert.equal(canAccessPanelPath('/panel/unknown', 'admin'), false);
  assert.equal(panelCapabilityForPath('/panel/resources/suggestions/123'), 'resource-suggestions');
});

test('article, project and news capabilities compose actor access with domain state', () => {
  const owner = actor('owner', null);
  const stranger = actor('stranger', null);
  const admin = actor('admin', 'admin');
  const curator = actor('curator', 'curator');
  const draft = { authorAccountId: 'owner', status: 'draft' as const, hiddenAt: null };
  const published = { authorAccountId: 'owner', status: 'published' as const, hiddenAt: null };
  const archived = { authorAccountId: 'owner', status: 'archived' as const, hiddenAt: null };

  assert.equal(isArticleAuthor(draft, owner), true);
  assert.equal(canEditArticle(draft, stranger), false);
  assert.equal(canPublishArticle(draft, owner) && isArticlePublishable(draft), true);
  assert.equal(canArchiveArticle(published, owner) && isArticleArchivable(published), true);
  assert.equal(canUnarchiveArticle(archived, owner) && isArticleUnarchivable(archived), true);
  assert.equal(canPublishArticle(draft, owner) && isArticlePublishable({ ...draft, hiddenAt: 'hidden' }), false);
  assert.equal(canDeleteArticle(published, admin), true);

  const projectDraft = { authorAccountId: 'owner', status: 'draft' as const };
  const projectPublished = { authorAccountId: 'owner', status: 'published' as const };
  const projectArchived = { authorAccountId: 'owner', status: 'archived' as const };
  assert.equal(isProjectPublic({ status: 'published', hiddenAt: null }), true);
  assert.equal(isProjectAuthor(projectDraft, owner), true);
  assert.equal(canEditProject(projectPublished, stranger), false);
  assert.equal(canPublishProject(projectDraft, owner) && isProjectPublishable(projectDraft), true);
  assert.equal(canArchiveProject(projectPublished, owner) && isProjectArchivable(projectPublished), true);
  assert.equal(canUnarchiveProject(projectArchived, owner) && isProjectUnarchivable(projectArchived), true);
  assert.equal(canDeleteProject(projectPublished, admin), true);

  const newsDraft = { status: 'draft' as const };
  const newsPublished = { status: 'published' as const };
  const newsArchived = { status: 'archived' as const };
  assert.equal(isNewsPublic(newsPublished), true);
  assert.equal(canEditNews(curator), true);
  assert.equal(canPublishNews(curator) && isNewsPublishable(newsDraft), true);
  assert.equal(canArchiveNews(curator) && isNewsArchivable(newsPublished), true);
  assert.equal(canUnarchiveNews(curator) && isNewsUnarchivable(newsArchived), true);
  assert.equal(canDeleteNews(admin), true);
});

test('job and resource capabilities compose actor scope with lifecycle predicates', () => {
  const manager = actor('manager', null, ['org-1']);
  const curator = actor('curator', 'curator');
  const moderator = actor('moderator', 'moderator');
  const admin = actor('admin', 'admin');
  const published = { publisherOrganizationId: 'org-1', status: 'published' as const };
  const expired = { publisherOrganizationId: 'org-1', status: 'expired' as const };
  const withdrawn = { publisherOrganizationId: null, status: 'withdrawn' as const };

  assert.equal(canEditJob(published, manager) && isJobEditable(published), true);
  assert.equal(canEditJob(published, actor('other', null)), false);
  assert.equal(canCloseJob(published, manager) && isJobClosable(published), true);
  assert.equal(canRenewJob(expired, manager) && isJobRenewable(expired), true);
  assert.equal(canWithdrawJob(expired, manager) && isJobWithdrawable(expired), true);
  assert.equal(canEditJob(withdrawn, curator) && isJobEditable(withdrawn), false);
  assert.equal(canDeleteJob(admin), true);
  assert.equal(canModerateJob(moderator), true);

  assert.equal(canManageResources(curator), true);
  assert.equal(canArchiveResource(curator) && isResourceArchivable({ status: 'active' }), true);
  assert.equal(canUnarchiveResource(curator) && isResourceUnarchivable({ status: 'archived' }), true);
  assert.equal(canDeleteResource(admin), true);
  assert.equal(canArchiveResource(moderator), false);
});

test('event, account moderation and organization capabilities keep access and domain separate', () => {
  const curator = actor('curator', 'curator');
  const moderator = actor('moderator', 'moderator');
  const admin = actor('admin', 'admin');
  const owner = actor('owner', null, ['org-1'], ['org-1']);

  assert.equal(canEditEvent(curator), true);
  assert.equal(canEditEvent(admin), true);
  assert.equal(canDeleteEvent(admin), true);
  assert.equal(canReviewEventSuggestions(curator), true);
  assert.equal(canViewEventManagement(moderator), true);

  assert.equal(canSuspendAccount(admin) && isAccountSuspendable({ moderationStatus: 'none' }), true);
  assert.equal(canSuspendAccount(admin) && isAccountSuspendable({ moderationStatus: 'suspended' }), false);
  assert.equal(canUnsuspendAccount(admin) && isAccountUnsuspendable({ moderationStatus: 'suspended' }), true);
  assert.equal(canBanAccount(admin) && isAccountBannable({ moderationStatus: 'suspended' }), true);
  assert.equal(canBanAccount(admin) && isAccountBannable({ moderationStatus: 'banned' }), false);
  assert.equal(canUnbanAccount(admin) && isAccountUnbannable({ moderationStatus: 'banned' }), true);
  assert.equal(canBanAccount(moderator), false);

  assert.equal(isOrganizationActive({ status: 'active' }), true);
  assert.equal(canManageOrganization('owner'), true);
  assert.equal(canManageOrganization('admin'), true);
  assert.equal(canManageOrganization('member'), false);
  assert.equal(canEditOrganization('org-1', owner), true);
  assert.equal(canArchiveOrganization('org-1', owner), true);
  assert.equal(canUnarchiveOrganization('org-1', owner), true);
  assert.equal(canManageOrganizationMemberships('org-1', owner), true);
  assert.equal(canDeleteOrganization('org-1', owner), true);
  assert.equal(canDeleteOrganization('org-2', owner), false);
  const membership = (accountId: string, role: 'owner' | 'admin' | 'member') => ({
    organizationId: 'org-1',
    accountId,
    role,
    username: null,
    displayName: null,
    avatarUrl: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  });
  assert.equal(hasAnotherOwner([membership('owner', 'owner'), membership('admin', 'admin')], 'owner'), false);
  assert.equal(hasAnotherOwner([membership('owner', 'owner'), membership('other', 'owner')], 'owner'), true);
});

test('question capabilities compose actor authority with question state', () => {
  const author = actor('author', null);
  const moderator = actor('moderator', 'moderator');
  const admin = actor('admin', 'admin');
  const question = {
    authorAccountId: 'author',
    status: 'open' as const,
    hiddenAt: null,
    acceptedAnswerId: null,
    answers: [
      { id: 'answer-1', authorAccountId: 'answer-author' },
      { id: 'answer-2', authorAccountId: null },
    ],
  };

  assert.equal(isQuestionAuthor(question, 'author'), true);
  assert.equal(isQuestionAuthor(question, null), false);
  assert.equal(isQuestionModerator('moderator'), true);
  assert.equal(isQuestionModerator('curator'), false);
  assert.equal(canModerateQuestion(moderator), true);
  assert.equal(canCloseQuestion(moderator) && isQuestionClosable(question), true);
  assert.equal(canReopenQuestion(moderator) && isQuestionReopenable({ status: 'closed' }), true);
  assert.equal(canHideQuestion(moderator) && isQuestionHideable(question), true);
  assert.equal(canUnhideQuestion(moderator) && isQuestionUnhideable({ hiddenAt: 'hidden' }), true);
  assert.equal(canAcceptQuestionAnswer(question, author), true);
  assert.equal(canDeleteQuestion(question, author), true);
  assert.equal(canDeleteQuestion(question, admin), true);
  assert.equal(isAnswerAuthor(question, 'answer-1', 'answer-author'), true);
  assert.equal(canDeleteQuestionAnswer(question, 'answer-1', admin), true);
  assert.equal(canSubmitQuestionAnswer(author) && isQuestionAnswerable(question), true);
  assert.equal(canSubmitQuestionAnswer(author) && isQuestionAnswerable({ status: 'closed' }), false);
  assert.equal(isQuestionSolved('answer-1'), true);
  assert.equal(isQuestionSolved(null), false);
});
