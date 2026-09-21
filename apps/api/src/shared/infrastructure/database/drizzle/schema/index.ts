/**
 * Physical Drizzle schema catalog.
 *
 * Infrastructure-only: never export this through a module public barrel or
 * import it from application/domain code.
 */
export * from '@/shared/infrastructure/database/drizzle/schema/communication/notification.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/article/articles.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/comment/comments.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/bookmark/resource-bookmarks.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/view/resource-views.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/vote/resource-votes.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/moderation/account-restrictions.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/communication/feedback.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/news/news.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/q-and-a/q-and-a.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/resource/resources.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/external-resource/external-resources.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/vote/vote-statistics.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/view/view-statistics.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/comment/comment-statistics.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/taxonomy/resource-tags.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/taxonomy/tag-identities.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/taxonomy/tag-workflows.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/taxonomy/tags.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/job/job.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/project/project.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/event/events.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/media/media-objects.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/user/account/account-emails.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/user/account/account-preferences.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/user/account/account-profiles.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/user/account/account-role.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/user/account/accounts.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/user/account/role.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/user/auth/auth-flow-proof.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential-oauth.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential-passkey.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential-password.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/user/auth/mfa-recovery-code.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/user/auth/mfa-totp.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/user/auth/sessions.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/user/organization/organizations.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/follow/tag-follows.schema';
export * from '@/shared/infrastructure/database/drizzle/schema/report/reports.schema';
