import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  canCloseJob,
  canDeleteJob,
  canEditJob,
  canModerateJob,
  canRenewJob,
  canWithdrawJob,
} from '../../../src/features/job/access/job.access.ts';
import {
  canArchiveProject,
  canDeleteProject,
  canEditProject,
  canPublishProject,
  canUnarchiveProject,
  isProjectAuthor,
} from '../../../src/features/project/access/project.access.ts';
import {
  canBanAccount,
  canSuspendAccount,
  canUnbanAccount,
  canUnsuspendAccount,
} from '../../../src/features/panel/access/account-moderation.access.ts';
import {
  canArchiveArticle,
  canDeleteArticle,
  canEditArticle,
  canPublishArticle,
  canUnarchiveArticle,
  isArticleAuthor,
} from '../../../src/features/article/access/article.access.ts';
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
  isQuestionAuthor,
  isQuestionModerator,
} from '../../../src/features/q-and-a/access/question.access.ts';
import { canCurate, canModerate } from '../../../src/features/auth/access/actor.access.ts';
import {
  canArchiveResource,
  canDeleteResource,
  canManageResources,
  canUnarchiveResource,
} from '../../../src/features/resource/access/resource.access.ts';
import {
  canDeleteEvent,
  canEditEvent,
  canReviewEventSuggestions,
  canViewEventManagement,
} from '../../../src/features/event/access/event.access.ts';
import {
  canDeleteOrganization,
  canEditOrganization,
} from '../../../src/features/organization/access/organization.access.ts';
import {
  canArchiveNews,
  canDeleteNews,
  canEditNews,
  canPublishNews,
  canUnarchiveNews,
} from '../../../src/features/news/access/news.access.ts';

test('job access is based on actor scope rather than lifecycle state', () => {
  const manager = { accountId: 'account-1', role: null, organizationIds: ['organization-1'] } as const;
  const stranger = { accountId: 'account-2', role: null, organizationIds: [] } as const;
  const curator = { accountId: 'curator', role: 'curator', organizationIds: [] } as const;
  const admin = { accountId: 'admin-1', role: 'admin', organizationIds: [] } as const;
  const organizationJob = { publisherOrganizationId: 'organization-1' } as const;
  const editorialJob = { publisherOrganizationId: null } as const;

  assert.equal(canEditJob(organizationJob, manager), true);
  assert.equal(canEditJob(organizationJob, stranger), false);
  assert.equal(canCloseJob(organizationJob, manager), true);
  assert.equal(canRenewJob(organizationJob, manager), true);
  assert.equal(canWithdrawJob(organizationJob, manager), true);
  assert.equal(canEditJob(editorialJob, curator), true);
  assert.equal(canDeleteJob(admin), true);
  assert.equal(canDeleteJob(manager), false);
  assert.equal(canModerateJob({ ...admin }), true);
});

test('project access predicates model account authorship independently from lifecycle', () => {
  const author = { accountId: 'author-1', role: null, organizationIds: [] } as const;
  const stranger = { accountId: 'manager-1', role: null, organizationIds: ['organization-1'] } as const;
  const admin = { accountId: 'admin-1', role: 'admin', organizationIds: [] } as const;
  const project = { authorAccountId: 'author-1' } as const;

  assert.equal(isProjectAuthor(project, author), true);
  assert.equal(canEditProject(project, stranger), false);
  assert.equal(canEditProject(project, author), true);
  assert.equal(canPublishProject(project, author), true);
  assert.equal(canArchiveProject(project, author), true);
  assert.equal(canUnarchiveProject(project, author), true);
  assert.equal(canDeleteProject(project, admin), true);
});

test('account moderation access is administrator authority only', () => {
  const admin = { accountId: 'admin', role: 'admin', organizationIds: [] } as const;
  const moderator = { accountId: 'moderator', role: 'moderator', organizationIds: [] } as const;

  assert.equal(canSuspendAccount(admin), true);
  assert.equal(canUnsuspendAccount(admin), true);
  assert.equal(canBanAccount(admin), true);
  assert.equal(canUnbanAccount(admin), true);
  assert.equal(canSuspendAccount(moderator), false);
  assert.equal(canBanAccount(moderator), false);
});

test('article access follows authorship and administrator delete authority without lifecycle checks', () => {
  const author = { accountId: 'author-1', role: null, organizationIds: [] } as const;
  const stranger = { accountId: 'author-2', role: null, organizationIds: [] } as const;
  const admin = { accountId: 'admin-1', role: 'admin', organizationIds: [] } as const;
  const article = { authorAccountId: 'author-1' } as const;

  assert.equal(isArticleAuthor(article, author), true);
  assert.equal(canEditArticle(article, stranger), false);
  assert.equal(canPublishArticle(article, author), true);
  assert.equal(canArchiveArticle(article, author), true);
  assert.equal(canUnarchiveArticle(article, author), true);
  assert.equal(canDeleteArticle(article, admin), true);
});

test('question access distinguishes authorship, authentication and moderation authority', () => {
  const author = { accountId: 'author-1', role: null, organizationIds: [] } as const;
  const anonymous = { accountId: null, role: null, organizationIds: [] } as const;
  const moderator = { accountId: 'moderator-1', role: 'moderator', organizationIds: [] } as const;
  const admin = { accountId: 'admin-1', role: 'admin', organizationIds: [] } as const;
  const question = {
    authorAccountId: 'author-1',
    answers: [{ id: 'answer-1', authorAccountId: 'answer-author' }],
  } as const;

  assert.equal(isQuestionAuthor({ authorAccountId: 'a' }, 'a'), true);
  assert.equal(isQuestionModerator('moderator'), true);
  assert.equal(isQuestionModerator('member'), false);
  assert.equal(canSubmitQuestionAnswer(author), true);
  assert.equal(canSubmitQuestionAnswer(anonymous), false);
  assert.equal(canAcceptQuestionAnswer(question, author), true);
  assert.equal(canDeleteQuestion(question, admin), true);
  assert.equal(canDeleteQuestionAnswer(question, 'answer-1', admin), true);
  assert.equal(canModerateQuestion(moderator), true);
  assert.equal(canCloseQuestion(moderator), true);
  assert.equal(canReopenQuestion(moderator), true);
  assert.equal(canHideQuestion(moderator), true);
  assert.equal(canUnhideQuestion(moderator), true);
});

test('resource editorial access belongs to curator and administrator regardless of lifecycle', () => {
  const curator = { accountId: 'curator-1', role: 'curator', organizationIds: [] } as const;
  const admin = { accountId: 'admin-1', role: 'admin', organizationIds: [] } as const;
  const moderator = { accountId: 'moderator-1', role: 'moderator', organizationIds: [] } as const;

  assert.equal(canManageResources(curator), true);
  assert.equal(canArchiveResource(curator), true);
  assert.equal(canUnarchiveResource(curator), true);
  assert.equal(canDeleteResource(admin), true);
  assert.equal(canArchiveResource(admin), true);
  assert.equal(canArchiveResource(moderator), false);
});

test('event and organization access follow role and organization management scope', () => {
  const manager = { accountId: 'manager-1', role: null, organizationIds: ['organization-1'] } as const;
  const curator = { accountId: 'curator-1', role: 'curator', organizationIds: [] } as const;
  const moderator = { accountId: 'moderator-1', role: 'moderator', organizationIds: [] } as const;
  const admin = { accountId: 'admin-1', role: 'admin', organizationIds: [] } as const;
  const owner = {
    accountId: 'owner-1',
    role: null,
    organizationIds: ['organization-1'],
    ownerOrganizationIds: ['organization-1'],
  } as const;

  assert.equal(canEditEvent(manager), false);
  assert.equal(canEditEvent(curator), true);
  assert.equal(canEditEvent(admin), true);
  assert.equal(canDeleteEvent(admin), true);
  assert.equal(canReviewEventSuggestions(curator), true);
  assert.equal(canReviewEventSuggestions(admin), true);
  assert.equal(canViewEventManagement(moderator), true);
  assert.equal(canEditOrganization('organization-1', manager), true);
  assert.equal(canDeleteOrganization('organization-1', owner), true);
  assert.equal(canDeleteOrganization('organization-1', manager), false);
});

test('news editorial access is independent from news lifecycle state', () => {
  const curator = { accountId: 'curator-1', role: 'curator', organizationIds: [] } as const;
  const moderator = { accountId: 'moderator-1', role: 'moderator', organizationIds: [] } as const;
  const admin = { accountId: 'admin-1', role: 'admin', organizationIds: [] } as const;

  assert.equal(canEditNews(curator), true);
  assert.equal(canEditNews(moderator), false);
  assert.equal(canEditNews(admin), true);
  assert.equal(canPublishNews(curator), true);
  assert.equal(canArchiveNews(curator), true);
  assert.equal(canUnarchiveNews(curator), true);
  assert.equal(canDeleteNews(admin), true);
});

test('administrator inherits editorial and moderation authority', () => {
  const admin = { accountId: 'admin-1', role: 'admin', organizationIds: [] } as const;
  const curator = { accountId: 'curator-1', role: 'curator', organizationIds: [] } as const;
  const moderator = { accountId: 'moderator-1', role: 'moderator', organizationIds: [] } as const;

  assert.equal(canCurate(admin), true);
  assert.equal(canCurate(curator), true);
  assert.equal(canCurate(moderator), false);
  assert.equal(canModerate(admin), true);
  assert.equal(canModerate(moderator), true);
  assert.equal(canModerate(curator), false);
});
