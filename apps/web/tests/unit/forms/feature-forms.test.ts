import assert from 'node:assert/strict';
import { test } from 'vitest';
import { createAccountPreferencesSchema } from '../../../src/features/account/ui/schemas/preferences.schema.ts';
import { createEmailSettingsSchemas } from '../../../src/features/account/ui/schemas/email.schema.ts';
import { createAccountLifecycleSchemas } from '../../../src/features/account/ui/schemas/lifecycle.schema.ts';
import { createMfaSchemas, createPasskeyDeviceNameSchema } from '../../../src/features/account/ui/schemas/mfa.schema.ts';
import { createChangePasswordSchema, createDeleteAccountConfirmationSchema, createPasswordCredentialSchema } from '../../../src/features/account/ui/schemas/security.schema.ts';
import { createUpdateProfileSchema } from '../../../src/features/account/ui/schemas/profile/forms.schema.ts';
import { createArticleFormSchema } from '../../../src/features/article/ui/schemas/forms.schema.ts';
import { articleSearchSchema } from '../../../src/features/article/ui/schemas/search.schema.ts';
import { createCommentFormSchema } from '../../../src/features/comment/ui/schemas/forms.schema.ts';
import { createContactFormSchema } from '../../../src/features/contact/ui/schemas/forms.schema.ts';
import { createEventFormSchema } from '../../../src/features/event/ui/schemas/forms.schema.ts';
import { eventSearchSchema } from '../../../src/features/event/ui/schemas/search.schema.ts';
import { createFeedbackFormSchema } from '../../../src/features/feedback/ui/schemas/forms.schema.ts';
import { createJobFormSchema } from '../../../src/features/job/ui/schemas/forms.schema.ts';
import { jobSearchSchema } from '../../../src/features/job/ui/schemas/search.schema.ts';
import { createNewsFormSchema, createNewsSuggestionSchema } from '../../../src/features/news/ui/schemas/forms.schema.ts';
import { newsSearchSchema } from '../../../src/features/news/ui/schemas/search.schema.ts';
import { createOrganizationFormSchema, createOrganizationMemberSchema } from '../../../src/features/organization/ui/schemas/forms.schema.ts';
import { createTaxonomySchemas, createNewsSuggestionReviewSchema, createEventSuggestionReviewSchema, createEventSuggestionRejectSchema, createResourceSuggestionReviewSchema, createResourceSuggestionRejectSchema } from '../../../src/features/panel/ui/schemas/forms.schema.ts';
import { createEventAdminFormSchema } from '../../../src/features/panel/ui/schemas/event-forms.schema.ts';
import { createUserAdminSchemas } from '../../../src/features/panel/ui/schemas/user-admin.schema.ts';
import { accountAdminUserSchema } from '../../../src/features/panel/ui/schemas/account-admin.schema.ts';
import { createProjectFormSchema } from '../../../src/features/project/ui/schemas/forms.schema.ts';
import { projectSearchSchema } from '../../../src/features/project/ui/schemas/search.schema.ts';
import { createAnswerFormSchema, createQuestionFormSchema } from '../../../src/features/q-and-a/ui/schemas/forms.schema.ts';
import { questionSearchSchema } from '../../../src/features/q-and-a/ui/schemas/search.schema.ts';
import { createReportFormSchema, createReportReviewSchema } from '../../../src/features/report/ui/schemas/forms.schema.ts';
import { createResourceApiSchema, createResourceSchema } from '../../../src/features/resource/ui/schemas/forms.schema.ts';
import { createResourceFields } from '../../../src/features/resource/ui/schemas/fields.schema.ts';
import { resourceSearchSchema } from '../../../src/features/resource/ui/schemas/search.schema.ts';
import { createResourceSuggestionSchema } from '../../../src/features/resource/ui/schemas/suggestion.schema.ts';
import { homeSearchSchema, parseHomeSearch, searchEndpointSchema } from '../../../src/features/home/ui/schemas/search.schema.ts';
import { parseListingSearch, parseSearchQuery } from '../../../src/shared/ui/schemas/search.schema.ts';

const uuid = '00000000-0000-4000-8000-000000000001';

test('account forms validate preferences, profile and password invariants', () => {
  assert.equal(createAccountPreferencesSchema('en').safeParse({ locale: 'en', profileVisibility: 'public' }).success, true);
  assert.equal(createAccountPreferencesSchema('en').safeParse({ locale: 'fr' }).success, false);

  const profile = createUpdateProfileSchema('en');
  assert.equal(profile.safeParse({ username: 'devhub', portfolioUrl: 'https://example.com' }).success, true);
  assert.equal(profile.safeParse({ username: 'x' }).success, false);
  assert.equal(profile.safeParse({ portfolioUrl: 'not-a-url' }).success, false);

  const password = createChangePasswordSchema('en');
  assert.equal(
    password.safeParse({ email: 'user@example.com', currentPassword: 'old', newPassword: 'new', confirmPassword: 'new' }).success,
    true,
  );
  assert.equal(password.safeParse({ email: 'user@example.com', currentPassword: 'old', newPassword: 'new', confirmPassword: 'other' }).success, false);
  assert.equal(createDeleteAccountConfirmationSchema('en').safeParse({ confirmation: 'delete' }).success, true);
  assert.equal(createDeleteAccountConfirmationSchema('en').safeParse({ confirmation: 'remove' }).success, false);

  const email = createEmailSettingsSchemas('en');
  assert.equal(email.changeEmail.safeParse({ email: 'new@example.com' }).success, true);
  assert.equal(email.token.safeParse({ token: '' }).success, false);
  const lifecycle = createAccountLifecycleSchemas('en');
  assert.equal(lifecycle.totp.safeParse({ code: '123456' }).success, true);
  assert.equal(lifecycle.recovery.safeParse({ code: 'recovery-code' }).success, true);
  const mfa = createMfaSchemas('en');
  assert.equal(mfa.totpEnrollment.safeParse({ code: '123456' }).success, true);
  assert.equal(mfa.disable.safeParse({ method: 'totp', code: '123456' }).success, true);
  assert.equal(mfa.disable.safeParse({ method: 'invalid', code: '123456' }).success, false);
  assert.equal(mfa.possessionProof.safeParse({ code: '123456' }).success, true);
  assert.equal(createPasskeyDeviceNameSchema('en').safeParse({ deviceName: 'Laptop' }).success, true);
  assert.equal(createPasswordCredentialSchema('en').safeParse({ newPassword: 'new', confirmPassword: 'other' }).success, false);
});

test('content forms enforce required text, tag and URL rules', () => {
  const article = createArticleFormSchema('en');
  assert.equal(article.safeParse({ title: 'Article', description: 'Description', content: 'Content', tags: ['typescript'] }).success, true);
  assert.equal(article.safeParse({ title: '', description: 'Description', content: 'Content', tags: [] }).success, false);
  assert.equal(article.safeParse({ title: 'Article', description: 'Description', content: 'Content', tags: ['Invalid Tag'] }).success, false);

  const news = createNewsFormSchema('en');
  assert.equal(news.safeParse({ title: 'News', description: 'Description', content: 'Content', tags: [], coverImageUrl: '' }).success, true);
  assert.equal(news.safeParse({ title: 'News', description: 'Description', content: 'Content', tags: [], coverImageUrl: 'bad' }).success, false);
  assert.equal(createNewsSuggestionSchema('en').safeParse({ url: 'https://example.com/news' }).success, true);

  const resource = createResourceSchema('en');
  assert.equal(resource.safeParse({ title: 'Resource', description: 'Description', url: 'https://example.com', tags: [] }).success, true);
  assert.equal(resource.safeParse({ title: 'Resource', description: 'Description', url: 'bad', tags: [] }).success, false);
  assert.equal(createResourceApiSchema('en').parse({ title: 'Resource', description: 'Description', url: 'https://example.com', tags: [], docsUrl: '' }).pricingModel, 'free');
  assert.equal(createResourceSuggestionSchema('en').safeParse({ url: 'https://example.com/resource' }).success, true);
  const resourceFields = createResourceFields('en');
  assert.equal(resourceFields.optionalUrlField.safeParse('').success, true);
  assert.equal(resourceFields.optionalUrlField.safeParse('invalid').success, false);
  assert.equal(resourceFields.tagsField.safeParse(['one', 'two']).success, true);

  const contact = createContactFormSchema('en');
  assert.equal(contact.safeParse({ type: 'support', email: 'user@example.com', subject: 'Help', message: 'A sufficiently long message.' }).success, true);
  assert.equal(contact.safeParse({ type: 'support', email: 'invalid', subject: 'Help', message: 'A sufficiently long message.' }).success, false);

  const comment = createCommentFormSchema('en');
  assert.equal(comment.safeParse({ content: 'A comment' }).success, true);
  assert.equal(comment.safeParse({ parentId: 'invalid', content: 'A comment' }).success, false);
});

test('event, job and project forms enforce cross-field constraints', () => {
  const event = createEventFormSchema('en', true);
  const validEvent = { url: 'https://example.com/event', title: 'An event', description: 'A sufficiently long event description.', startsAt: '2026-10-01T10:00:00Z', endsAt: '2026-10-01T11:00:00Z', format: 'online' as const };
  assert.equal(event.safeParse(validEvent).success, true);
  assert.equal(event.safeParse({ ...validEvent, endsAt: validEvent.startsAt }).success, false);
  assert.equal(createEventFormSchema('en', false).safeParse({ url: 'https://example.com/event' }).success, true);
  assert.equal(createEventFormSchema('en', false).safeParse({ url: 'http://example.com/event' }).success, false);

  const job = createJobFormSchema('en');
  const validJob = { title: 'Frontend developer', description: 'A sufficiently long job description for validation.', employmentType: 'full_time' as const, workplaceType: 'onsite' as const, location: 'São Paulo', compensationMin: '100', compensationMax: '', compensationCurrency: 'BRL', compensationUnit: 'monthly' as const, applicationUrl: 'https://example.com/apply', sourceUrl: '', tagSlugs: [] };
  assert.equal(job.safeParse(validJob).success, true);
  assert.equal(job.safeParse({ ...validJob, location: '' }).success, false);
  assert.equal(job.safeParse({ ...validJob, workplaceType: 'remote', location: '' }).success, true);

  const project = createProjectFormSchema('en');
  assert.equal(project.safeParse({ title: 'Project', summary: '', description: '', projectUrl: '', repositoryUrl: '', tagSlugs: [] }).success, true);
  assert.equal(project.safeParse({ title: 'Project', summary: '', description: '', projectUrl: 'invalid', tagSlugs: [] }).success, false);
});

test('question, answer, feedback and report forms validate their payload boundaries', () => {
  const question = createQuestionFormSchema('en');
  assert.equal(question.safeParse({ title: 'A useful question', content: 'A question with enough content.', tagSlugs: ['typescript'] }).success, true);
  assert.equal(question.safeParse({ title: 'Short', content: 'A question with enough content.', tagSlugs: [] }).success, false);
  assert.equal(createAnswerFormSchema('en').safeParse({ content: 'An answer' }).success, true);

  const feedback = createFeedbackFormSchema('en');
  assert.equal(feedback.safeParse({ category: 'bug', description: 'This is a useful report.', contextUrl: 'https://example.com' }).success, true);
  assert.equal(feedback.safeParse({ category: 'bug', description: 'short' }).success, false);
  assert.equal(feedback.safeParse({ category: 'bug', description: 'This is a useful report.', contextUrl: 'invalid' }).success, false);

  const report = createReportFormSchema('en');
  assert.equal(report.safeParse({ reason: 'Incorrect content' }).success, true);
  assert.equal(report.safeParse({ reason: '' }).success, false);
});

test('organization forms validate organization types and member identity', () => {
  const organization = createOrganizationFormSchema('en');
  assert.equal(organization.safeParse({ name: 'DevHub', type: 'community', description: 'A community', websiteUrl: '' }).success, true);
  assert.equal(organization.safeParse({ name: 'D', type: 'community', description: 'A community' }).success, false);
  assert.equal(organization.safeParse({ name: 'DevHub', type: 'community', description: 'A community', websiteUrl: 'invalid' }).success, false);

  const member = createOrganizationMemberSchema('en');
  assert.equal(member.safeParse({ accountId: uuid, role: 'member' }).success, true);
  assert.equal(member.safeParse({ accountId: 'invalid', role: 'member' }).success, false);
});

test('administrative forms validate taxonomy, moderation and suggestion workflows', () => {
  const taxonomy = createTaxonomySchemas('en');
  assert.equal(taxonomy.createTag.safeParse({ name: 'TypeScript', slug: 'typescript' }).success, true);
  assert.equal(taxonomy.createTag.safeParse({ name: 'TypeScript', slug: 'Type Script' }).success, false);
  assert.equal(taxonomy.updateTag.safeParse({ name: 'TypeScript', slug: 'typescript' }).success, true);
  assert.equal(taxonomy.alias.safeParse({ tagId: uuid, alias: 'ts' }).success, true);
  assert.equal(taxonomy.protectedTerm.safeParse({ value: 'typescript', kind: 'reserved' }).success, true);
  assert.equal(taxonomy.merge.safeParse({ sourceTagId: uuid, targetTagId: uuid }).success, false);
  assert.equal(taxonomy.merge.safeParse({ sourceTagId: uuid, targetTagId: '00000000-0000-4000-8000-000000000002' }).success, true);

  const event = createEventAdminFormSchema('en');
  const eventValue = { title: 'Admin event', description: 'Description', url: 'https://example.com/event', startsAt: '2026-10-01T10:00:00Z', endsAt: '2026-10-01T11:00:00Z', format: 'online' as const };
  assert.equal(event.safeParse(eventValue).success, true);
  assert.equal(event.safeParse({ ...eventValue, endsAt: eventValue.startsAt }).success, false);

  const admin = createUserAdminSchemas('en');
  assert.equal(admin.suspension.safeParse({ lockedUntil: '2026-10-01' }).success, true);
  assert.equal(admin.restriction.safeParse({ capability: 'COMMENT', reason: 'Repeated abuse' }).success, true);
  assert.equal(admin.restriction.safeParse({ capability: 'UNKNOWN', reason: 'Repeated abuse' }).success, false);

  assert.equal(createEventSuggestionReviewSchema('en').safeParse({ title: 'Event', description: 'Description', startsAt: '2026-10-01', endsAt: '2026-10-02', format: 'online' }).success, true);
  assert.equal(createEventSuggestionRejectSchema('en').safeParse({ reason: 'Duplicate' }).success, true);
  assert.equal(createNewsSuggestionReviewSchema('en').safeParse({ title: 'News', description: '', content: '' }).success, true);
  assert.equal(createResourceSuggestionReviewSchema('en').safeParse({ title: 'Resource', description: 'Description', tags: [] }).success, true);
  assert.equal(createResourceSuggestionRejectSchema().safeParse({ decisionNote: 'Duplicate' }).success, true);
  assert.equal(createReportReviewSchema('en').safeParse({ note: 'Reviewed' }).success, true);
  assert.equal(accountAdminUserSchema.safeParse({ id: uuid, voluntaryStatus: 'active', moderationStatus: 'none', deletionStatus: 'none', deletionRequestedAt: null, status: 'active', mfaEnabled: false, lockedUntil: null, email: null, username: null, role: null, createdAt: '2026-01-01T00:00:00Z' }).success, true);
});

test('search schemas normalize query, tags, mode, types and pagination', () => {
  const query = parseSearchQuery(new URLSearchParams('q=%20typescript%20&tags=web%2Csolid&tags=astro&page=0'));
  assert.deepEqual(query, { q: 'typescript', tags: ['web', 'solid', 'astro'], page: 1 });
  assert.deepEqual(parseListingSearch(new URLSearchParams('q=article&tags=web,astro&page=3')), {
    query: 'article',
    tags: ['web', 'astro'],
    page: 3,
  });
  assert.equal(searchEndpointSchema.safeParse({ q: 'ab', limit: '50' }).success, true);
  assert.equal(searchEndpointSchema.safeParse({ q: 'a', limit: '10' }).success, false);

  const search = parseHomeSearch(new URLSearchParams('q=solid&types=article,invalid&mode=invalid'));
  assert.deepEqual(search, { q: 'solid', tags: [], types: ['article'], mode: 'search', page: 1 });
  assert.equal(homeSearchSchema.safeParse({ q: 'x', types: ['article'], mode: 'recent' }).success, true);
  assert.equal(articleSearchSchema.safeParse({ query: 'x', tags: [], sort: 'votes', period: 'week', page: 1 }).success, true);
  assert.equal(newsSearchSchema.safeParse({ query: 'x', tags: [], sort: 'oldest', period: 'month', page: 1 }).success, true);
  assert.equal(eventSearchSchema.safeParse({ query: 'x', tags: [], temporalState: 'upcoming', format: 'online', sort: 'recent', page: 1 }).success, true);
  assert.equal(jobSearchSchema.safeParse({ query: 'x', tags: [], employmentType: 'full_time', workplaceType: 'remote', location: '', minComp: '10', sort: 'comp', page: 1 }).success, true);
  assert.equal(jobSearchSchema.safeParse({ query: '', tags: [], employmentType: null, workplaceType: null, location: null, minComp: null, sort: null, page: 1 }).success, true);
  assert.equal(projectSearchSchema.safeParse({ query: 'x', tags: [], sort: 'title', page: 1 }).success, true);
  assert.equal(questionSearchSchema.safeParse({ query: 'x', tags: [], status: 'open', sort: 'answers', page: 1 }).success, true);
  assert.equal(resourceSearchSchema.safeParse({ query: 'x', tags: [], page: 1 }).success, true);
});
