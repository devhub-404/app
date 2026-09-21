/**
 * Generated from the API OpenAPI document.
 * OpenAPI SHA-256: 106e068df8e4ebf75acc785b2b249c592b1fd89c972e0daf2e845978e6ca39dd.
 * Do not edit manually.
 */

export interface paths {
  "/api/v1/internal/scheduled-jobs/run": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["ScheduledJobsController_run_v1"];
  };
  "/api/v1/me": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["AccountController_getMe_v1"];
    delete: operations["AccountController_deleteMe_v1"];
  };
  "/api/v1/me/details": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["AccountController_getMyDetails_v1"];
  };
  "/api/v1/me/deactivate": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AccountController_deactivateMe_v1"];
  };
  "/api/v1/profiles/me": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ProfilesController_getMeProfile_v1"];
    patch: operations["ProfilesController_updateMeProfile_v1"];
  };
  "/api/v1/profiles/{username}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ProfilesController_getByUsername_v1"];
  };
  "/api/v1/me/preferences": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["MePreferencesController_getPreferences_v1"];
    patch: operations["MePreferencesController_updatePreferences_v1"];
  };
  "/api/v1/accounts/{id}/suspend": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AccountAdminController_suspend_v1"];
  };
  "/api/v1/accounts/{id}/unsuspend": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AccountAdminController_unsuspend_v1"];
  };
  "/api/v1/accounts/{id}/ban": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AccountAdminController_ban_v1"];
  };
  "/api/v1/accounts/{id}/unban": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AccountAdminController_unban_v1"];
  };
  "/api/v1/accounts/{id}/roles": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    patch: operations["AccountAdminController_assignRoles_v1"];
  };
  "/api/v1/accounts": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["AccountAdminController_listAccounts_v1"];
  };
  "/api/v1/accounts/{id}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["AccountAdminController_getAccount_v1"];
  };
  "/api/v1/emails/verify/resend": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthEmailsController_resendEmailVerification_v1"];
  };
  "/api/v1/emails/verify/start": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthEmailsController_startEmailVerification_v1"];
  };
  "/api/v1/emails/verify/complete": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthEmailsController_completeEmailVerification_v1"];
  };
  "/api/v1/emails/primary/change/start": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthEmailsController_startPrimaryEmailChange_v1"];
  };
  "/api/v1/emails/primary/change/complete": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthEmailsController_completePrimaryEmailChange_v1"];
  };
  "/api/v1/emails/backup/change/start": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthEmailsController_startBackupEmailChange_v1"];
  };
  "/api/v1/emails/backup/change/complete": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthEmailsController_completeBackupEmailChange_v1"];
  };
  "/api/v1/emails/backup": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    delete: operations["AuthEmailsController_deleteBackupEmail_v1"];
  };
  "/api/v1/account-recovery/start": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AccountRecoveryController_startAccountRecovery_v1"];
  };
  "/api/v1/account-recovery/complete": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AccountRecoveryController_completeAccountRecovery_v1"];
  };
  "/api/v1/login/magic-link/start": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthMagicLinkController_startMagicLinkLogin_v1"];
  };
  "/api/v1/login/magic-link/complete": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthMagicLinkController_completeMagicLinkLogin_v1"];
  };
  "/api/v1/mfa/configuration": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["AuthMfaController_getMyMfaConfiguration_v1"];
  };
  "/api/v1/mfa/enroll/totp/start": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthMfaController_enrollStart_v1"];
  };
  "/api/v1/mfa/enroll/totp/complete": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthMfaController_enrollComplete_v1"];
  };
  "/api/v1/mfa/totp/disable": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthMfaController_disableTotp_v1"];
  };
  "/api/v1/mfa/verify/totp": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthMfaController_verifyTotp_v1"];
  };
  "/api/v1/mfa/verify/recovery-code": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthMfaController_verifyRecoveryCode_v1"];
  };
  "/api/v1/mfa/recovery-codes/regenerate": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthMfaController_regenerateRecoveryCodes_v1"];
  };
  "/api/v1/oauth/{provider}/login/start": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthOAuthController_startOAuthLogin_v1"];
  };
  "/api/v1/oauth/{provider}/login/complete": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthOAuthController_completeOAuthLogin_v1"];
  };
  "/api/v1/oauth/{provider}/link/start": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthOAuthController_startOAuthLink_v1"];
  };
  "/api/v1/oauth/{provider}/link/complete": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthOAuthController_completeOAuthLink_v1"];
  };
  "/api/v1/authentication-methods": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["AuthenticationMethodsController_list_v1"];
  };
  "/api/v1/credentials/passkeys": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["AuthPasskeysController_listPasskeyDevices_v1"];
  };
  "/api/v1/login/passkey/start": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthPasskeysController_startPasskeyLogin_v1"];
  };
  "/api/v1/login/passkey/complete": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthPasskeysController_completePasskeyLogin_v1"];
  };
  "/api/v1/register/passkey/start": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthPasskeysController_startPasskeyRegistration_v1"];
  };
  "/api/v1/register/passkey/complete": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthPasskeysController_completePasskeyRegistration_v1"];
  };
  "/api/v1/credentials/passkeys/{credentialId}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    patch: operations["AuthPasskeysController_updatePasskeyDeviceName_v1"];
  };
  "/api/v1/credentials/{credentialId}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    delete: operations["AuthPasskeysController_deleteCredential_v1"];
  };
  "/api/v1/possession-proof/start": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthPossessionProofController_start_v1"];
  };
  "/api/v1/possession-proof/complete": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthPossessionProofController_complete_v1"];
  };
  "/api/v1/register/password/start": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthPasswordController_startPasswordRegistration_v1"];
  };
  "/api/v1/register/password/complete": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthPasswordController_completePasswordRegistration_v1"];
  };
  "/api/v1/login/password/start": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthPasswordController_startPasswordLogin_v1"];
  };
  "/api/v1/login/password/complete": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthPasswordController_completePasswordLogin_v1"];
  };
  "/api/v1/recover/password/start": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthPasswordController_startPasswordRecovery_v1"];
  };
  "/api/v1/recover/password/complete": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthPasswordController_completePasswordRecovery_v1"];
  };
  "/api/v1/recover/password/prepare": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthPasswordController_preparePasswordRecovery_v1"];
  };
  "/api/v1/change/password/start": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthPasswordController_startPasswordChange_v1"];
  };
  "/api/v1/change/password/complete": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthPasswordController_completePasswordChange_v1"];
  };
  "/api/v1/credentials/password/start": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthPasswordController_startPasswordCredentialCreate_v1"];
  };
  "/api/v1/credentials/password/complete": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AuthPasswordController_completePasswordCredentialCreate_v1"];
  };
  "/api/v1/sessions": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["AuthSessionsController_listSessions_v1"];
    delete: operations["AuthSessionsController_revokeAllSessions_v1"];
  };
  "/api/v1/sessions/current": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["AuthSessionsController_getCurrentSession_v1"];
    delete: operations["AuthSessionsController_revokeCurrentSession_v1"];
  };
  "/api/v1/sessions/others": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    delete: operations["AuthSessionsController_revokeOtherSessions_v1"];
  };
  "/api/v1/sessions/{sessionId}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    delete: operations["AuthSessionsController_revokeSession_v1"];
  };
  "/api/v1/account/reactivate": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AccountController_reactivateFromToken_v1"];
  };
  "/api/v1/account/deletion/cancel": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AccountController_cancelDeletion_v1"];
  };
  "/api/v1/media/uploads": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["MediaController_request_v1"];
  };
  "/api/v1/media/uploads/confirm": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["MediaController_confirm_v1"];
  };
  "/api/v1/me/notifications": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["NotificationController_sync_v1"];
  };
  "/api/v1/me/notifications/{id}/read": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    patch: operations["NotificationController_markRead_v1"];
  };
  "/api/v1/me/notifications/read-all": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["NotificationController_markAllRead_v1"];
  };
  "/api/v1/votes/{resourceId}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    put: operations["VoteController_set_v1"];
    delete: operations["VoteController_remove_v1"];
  };
  "/api/v1/me/votes": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["VoteController_syncMine_v1"];
  };
  "/api/v1/bookmarks/{resourceId}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    put: operations["BookmarkController_saveBookmark_v1"];
    delete: operations["BookmarkController_removeBookmark_v1"];
  };
  "/api/v1/me/bookmarks/sync": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["BookmarkController_syncBookmarks_v1"];
  };
  "/api/v1/me/bookmarks": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["BookmarkController_listBookmarks_v1"];
  };
  "/api/v1/views/{resourceId}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["ViewController_recordView_v1"];
  };
  "/api/v1/comments/me": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["CommentsController_listMine_v1"];
  };
  "/api/v1/comments/administration": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["CommentsController_listForAdministration_v1"];
  };
  "/api/v1/comments/{id}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    patch: operations["CommentsController_updateComment_v1"];
    delete: operations["CommentsController_deleteComment_v1"];
  };
  "/api/v1/articles/{articleId}/comments": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["DomainCommentsController_listArticleComments_v1"];
    post: operations["DomainCommentsController_createArticleComment_v1"];
  };
  "/api/v1/news/{newsId}/comments": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["DomainCommentsController_listNewsComments_v1"];
    post: operations["DomainCommentsController_createNewsComment_v1"];
  };
  "/api/v1/moderation/resources/{resourceId}/hide": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["ModerationController_hideResourceById_v1"];
  };
  "/api/v1/moderation/resources/{resourceId}/unhide": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["ModerationController_unhideResourceById_v1"];
  };
  "/api/v1/moderation/comments/{commentId}/hide": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["ModerationController_hideCommentById_v1"];
  };
  "/api/v1/moderation/comments/{commentId}/unhide": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["ModerationController_unhideCommentById_v1"];
  };
  "/api/v1/moderation/hidden": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ModerationController_listHidden_v1"];
  };
  "/api/v1/moderation/accounts/{accountId}/standing": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["AccountRestrictionsController_getStanding_v1"];
  };
  "/api/v1/moderation/accounts/{accountId}/restrictions": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AccountRestrictionsController_restrict_v1"];
  };
  "/api/v1/moderation/accounts/{accountId}/restrictions/{restrictionId}/revoke": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["AccountRestrictionsController_revoke_v1"];
  };
  "/api/v1/articles": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ArticlesController_list_v1"];
  };
  "/api/v1/articles/tags/popular": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ArticlesController_listPopularTags_v1"];
  };
  "/api/v1/articles/rss": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ArticlesController_rss_v1"];
  };
  "/api/v1/articles/me": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ArticlesController_listOwn_v1"];
  };
  "/api/v1/articles/administration": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ArticlesController_listForModeration_v1"];
  };
  "/api/v1/articles/id/{id}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ArticlesController_getById_v1"];
  };
  "/api/v1/articles/id/{id}/content": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ArticlesController_getContentById_v1"];
  };
  "/api/v1/articles/{slug}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ArticlesController_getBySlug_v1"];
  };
  "/api/v1/articles/{slug}/content": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ArticlesController_getContentBySlug_v1"];
  };
  "/api/v1/articles/drafts": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["ArticlesController_saveDraft_v1"];
  };
  "/api/v1/articles/{id}/publish": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["ArticlesController_publish_v1"];
  };
  "/api/v1/articles/{id}/archive": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["ArticlesController_archive_v1"];
  };
  "/api/v1/articles/{id}/unarchive": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["ArticlesController_unarchive_v1"];
  };
  "/api/v1/articles/{id}/comments/settings": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    patch: operations["ArticlesController_setCommentsEnabled_v1"];
  };
  "/api/v1/articles/{id}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    patch: operations["ArticlesController_update_v1"];
    delete: operations["ArticlesController_delete_v1"];
  };
  "/api/v1/news": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["NewsController_list_v1"];
  };
  "/api/v1/news/rss": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["NewsController_rss_v1"];
  };
  "/api/v1/news/sources/popular": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["NewsController_listPopularSources_v1"];
  };
  "/api/v1/news/suggestions": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["NewsController_submitSuggestion_v1"];
  };
  "/api/v1/news/suggestions/pending": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["NewsController_listPendingSuggestions_v1"];
  };
  "/api/v1/news/suggestions/me": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["NewsController_listMySuggestions_v1"];
  };
  "/api/v1/news/suggestions/{id}/accept": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["NewsController_acceptSuggestion_v1"];
  };
  "/api/v1/news/suggestions/{id}/reject": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["NewsController_rejectSuggestion_v1"];
  };
  "/api/v1/news/administration": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["NewsController_listForManagement_v1"];
  };
  "/api/v1/news/id/{id}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["NewsController_getById_v1"];
  };
  "/api/v1/news/{slug}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["NewsController_getBySlug_v1"];
  };
  "/api/v1/news/drafts": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["NewsController_saveDraft_v1"];
  };
  "/api/v1/news/{id}/publish": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["NewsController_publish_v1"];
  };
  "/api/v1/news/{id}/archive": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["NewsController_archive_v1"];
  };
  "/api/v1/news/{id}/unarchive": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["NewsController_unarchive_v1"];
  };
  "/api/v1/news/{id}/comments/settings": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    patch: operations["NewsController_setCommentsEnabled_v1"];
  };
  "/api/v1/news/{id}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    patch: operations["NewsController_update_v1"];
    delete: operations["NewsController_delete_v1"];
  };
  "/api/v1/resources": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ResourcesController_list_v1"];
    post: operations["ResourcesController_create_v1"];
  };
  "/api/v1/resources/suggestions/pending": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ResourcesController_listPendingSuggestions_v1"];
  };
  "/api/v1/resources/suggestions/me": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ResourcesController_listMySuggestions_v1"];
  };
  "/api/v1/resources/administration": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ResourcesController_listForManagement_v1"];
  };
  "/api/v1/resources/id/{id}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ResourcesController_getForManagement_v1"];
  };
  "/api/v1/resources/{id}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ResourcesController_getById_v1"];
    patch: operations["ResourcesController_update_v1"];
    delete: operations["ResourcesController_delete_v1"];
  };
  "/api/v1/resources/suggestions": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["ResourcesController_suggest_v1"];
  };
  "/api/v1/resources/suggestions/{id}/accept": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["ResourcesController_approveSuggestion_v1"];
  };
  "/api/v1/resources/suggestions/{id}/reject": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["ResourcesController_rejectSuggestion_v1"];
  };
  "/api/v1/resources/{id}/archive": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["ResourcesController_archive_v1"];
  };
  "/api/v1/resources/{id}/unarchive": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["ResourcesController_unarchive_v1"];
  };
  "/api/v1/taxonomy/tags/aliases": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["TaxonomyTagsController_aliases_v1"];
    post: operations["TaxonomyTagsController_createAlias_v1"];
  };
  "/api/v1/taxonomy/tags/aliases/{id}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    delete: operations["TaxonomyTagsController_deleteAlias_v1"];
  };
  "/api/v1/taxonomy/tags/identity-terms": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["TaxonomyTagsController_identityTerms_v1"];
    put: operations["TaxonomyTagsController_setIdentityTerm_v1"];
  };
  "/api/v1/taxonomy/tags/identity-terms/{id}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    delete: operations["TaxonomyTagsController_deleteIdentityTerm_v1"];
  };
  "/api/v1/taxonomy/tags": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["TaxonomyTagsController_list_v1"];
    post: operations["TaxonomyTagsController_create_v1"];
  };
  "/api/v1/taxonomy/tags/page": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["TaxonomyTagsController_page_v1"];
  };
  "/api/v1/taxonomy/tags/resolve": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["TaxonomyTagsController_resolve_v1"];
  };
  "/api/v1/taxonomy/tags/{id}/archive": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["TaxonomyTagsController_archive_v1"];
  };
  "/api/v1/taxonomy/tags/{id}/unarchive": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["TaxonomyTagsController_unarchive_v1"];
  };
  "/api/v1/taxonomy/tags/{id}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    patch: operations["TaxonomyTagsController_update_v1"];
    delete: operations["TaxonomyTagsController_delete_v1"];
  };
  "/api/v1/taxonomy/tags/merges": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["TaxonomyTagsController_merge_v1"];
  };
  "/api/v1/discovery/search": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["DiscoveryController_search_v1"];
  };
  "/api/v1/discovery/feed": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["DiscoveryController_feed_v1"];
  };
  "/api/v1/discovery/trending": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["DiscoveryController_trending_v1"];
  };
  "/api/v1/discovery/popular": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["DiscoveryController_popular_v1"];
  };
  "/api/v1/discovery/recent": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["DiscoveryController_recent_v1"];
  };
  "/api/v1/discovery/related/{resourceId}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["DiscoveryController_related_v1"];
  };
  "/api/v1/questions": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["QAndAController_list_v1"];
    post: operations["QAndAController_create_v1"];
  };
  "/api/v1/questions/mine": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["QAndAController_listMine_v1"];
  };
  "/api/v1/questions/administration": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["QAndAController_listForAdministration_v1"];
  };
  "/api/v1/questions/{id}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["QAndAController_get_v1"];
    delete: operations["QAndAController_delete_v1"];
  };
  "/api/v1/questions/{id}/answers": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["QAndAController_answer_v1"];
  };
  "/api/v1/questions/{id}/accepted-answer/{answerId}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    put: operations["QAndAController_accept_v1"];
  };
  "/api/v1/questions/{id}/accepted-answer": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    delete: operations["QAndAController_removeAccepted_v1"];
  };
  "/api/v1/questions/{id}/answers/{answerId}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    delete: operations["QAndAController_deleteAnswer_v1"];
  };
  "/api/v1/questions/{id}/close": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["QAndAController_close_v1"];
  };
  "/api/v1/questions/{id}/reopen": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["QAndAController_reopen_v1"];
  };
  "/api/v1/answers/mine": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["AnswersController_listMine_v1"];
  };
  "/api/v1/jobs/administration": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["JobController_listManagement_v1"];
  };
  "/api/v1/jobs": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["JobController_list_v1"];
    post: operations["JobController_create_v1"];
  };
  "/api/v1/jobs/me": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["JobController_mine_v1"];
  };
  "/api/v1/jobs/{id}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["JobController_get_v1"];
    patch: operations["JobController_update_v1"];
    delete: operations["JobController_delete_v1"];
  };
  "/api/v1/jobs/suggestions": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["JobController_submit_v1"];
  };
  "/api/v1/jobs/suggestions/me": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["JobController_mySuggestions_v1"];
  };
  "/api/v1/jobs/suggestions/pending": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["JobController_pendingSuggestions_v1"];
  };
  "/api/v1/jobs/suggestions/{id}/accept": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["JobController_acceptSuggestion_v1"];
  };
  "/api/v1/jobs/suggestions/{id}/reject": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["JobController_rejectSuggestion_v1"];
  };
  "/api/v1/jobs/{id}/close": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["JobController_close_v1"];
  };
  "/api/v1/jobs/{id}/withdraw": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["JobController_withdraw_v1"];
  };
  "/api/v1/jobs/{id}/renew": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["JobController_renew_v1"];
  };
  "/api/v1/projects/administration": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ProjectController_listManagement_v1"];
  };
  "/api/v1/projects": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ProjectController_list_v1"];
    post: operations["ProjectController_create_v1"];
  };
  "/api/v1/projects/me": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ProjectController_mine_v1"];
  };
  "/api/v1/projects/{slug}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ProjectController_get_v1"];
  };
  "/api/v1/projects/id/{id}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ProjectController_getById_v1"];
  };
  "/api/v1/projects/{id}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    patch: operations["ProjectController_update_v1"];
    delete: operations["ProjectController_remove_v1"];
  };
  "/api/v1/projects/{id}/publish": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["ProjectController_publish_v1"];
  };
  "/api/v1/projects/{id}/archive": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["ProjectController_archive_v1"];
  };
  "/api/v1/projects/{id}/unarchive": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["ProjectController_unarchive_v1"];
  };
  "/api/v1/events": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["EventController_list_v1"];
    post: operations["EventController_create_v1"];
  };
  "/api/v1/events/administration": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["EventController_listManagement_v1"];
  };
  "/api/v1/events/suggestions": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["EventController_submit_v1"];
  };
  "/api/v1/events/suggestions/me": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["EventController_mySuggestions_v1"];
  };
  "/api/v1/events/suggestions/pending": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["EventController_pendingSuggestions_v1"];
  };
  "/api/v1/events/suggestions/{id}/accept": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["EventController_accept_v1"];
  };
  "/api/v1/events/suggestions/{id}/reject": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["EventController_reject_v1"];
  };
  "/api/v1/events/id/{id}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["EventController_getManagement_v1"];
  };
  "/api/v1/events/{slug}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["EventController_get_v1"];
  };
  "/api/v1/events/{id}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    patch: operations["EventController_update_v1"];
    delete: operations["EventController_delete_v1"];
  };
  "/api/v1/events/{id}/status": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    patch: operations["EventController_review_v1"];
  };
  "/api/v1/organizations": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["OrganizationController_list_v1"];
    post: operations["OrganizationController_create_v1"];
  };
  "/api/v1/organizations/me": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["OrganizationController_mine_v1"];
  };
  "/api/v1/organizations/{slug}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["OrganizationController_get_v1"];
  };
  "/api/v1/organizations/{id}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    patch: operations["OrganizationController_update_v1"];
    delete: operations["OrganizationController_delete_v1"];
  };
  "/api/v1/organizations/{id}/archive": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["OrganizationController_archive_v1"];
  };
  "/api/v1/organizations/{id}/unarchive": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["OrganizationController_unarchive_v1"];
  };
  "/api/v1/organizations/{id}/members": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["OrganizationController_members_v1"];
    post: operations["OrganizationController_addMember_v1"];
  };
  "/api/v1/organizations/{id}/members/{accountId}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    patch: operations["OrganizationController_changeRole_v1"];
    delete: operations["OrganizationController_removeMember_v1"];
  };
  "/api/v1/organizations/{id}/leave": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["OrganizationController_leave_v1"];
  };
  "/api/v1/tags/following": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["TagFollowController_list_v1"];
  };
  "/api/v1/tags/{slug}/follow": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["TagFollowController_follow_v1"];
    delete: operations["TagFollowController_unfollow_v1"];
  };
  "/api/v1/resources/{resourceId}/reports": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["ReportController_reportResource_v1"];
  };
  "/api/v1/comments/{commentId}/reports": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["ReportController_reportComment_v1"];
  };
  "/api/v1/reports/resources": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ReportController_listResourceReports_v1"];
  };
  "/api/v1/reports/comments": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["ReportController_listCommentReports_v1"];
  };
  "/api/v1/reports/resources/{id}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    patch: operations["ReportController_reviewResourceReport_v1"];
  };
  "/api/v1/reports/comments/{id}": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    patch: operations["ReportController_reviewCommentReport_v1"];
  };
  "/api/v1/platform/health": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["PlatformController_getHealth_v1"];
  };
  "/api/v1/platform/readiness": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["PlatformController_getReadiness_v1"];
  };
  "/api/v1/contact": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["ContactController_submit_v1"];
  };
  "/api/v1/feedback": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    post: operations["FeedbackController_submit_v1"];
  };
  "/api/v1/feedback/administration": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations["FeedbackController_listForAdministration_v1"];
  };
  "/api/v1/feedback/{id}/status": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    patch: operations["FeedbackController_updateStatus_v1"];
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    "ApiResponseDTO": 
    {
      "code": string;
      "message": string;
      "data": 
    {

    } | null;
    };
    "AccountShellAccountDTO": 
    {
      "id": string;
      "status": "active" | "deactivated" | "suspended" | "banned";
    };
    "AccountShellProfileDTO": 
    {
      "username": string;
      "displayName": string | null;
      "avatarUrl": string | null;
    };
    "AccountShellPreferencesDTO": 
    {
      "locale": "pt" | "en" | "es" | null;
    };
    "AccountShellDTO": 
    {
      "account": components["schemas"]["AccountShellAccountDTO"];
      "profile": components["schemas"]["AccountShellProfileDTO"];
      "preferences": components["schemas"]["AccountShellPreferencesDTO"];
      "role": "curator" | "admin" | "moderator" | null;
    };
    "AccountSummaryDTO": 
    {
      "id": string;
      "voluntaryStatus": "active" | "deactivated";
      "moderationStatus": "none" | "suspended" | "banned";
      "deletionStatus": "none" | "pending";
      "deletionRequestedAt": string | null;
      "status": "active" | "deactivated" | "suspended" | "banned";
      "mfaEnabled": boolean;
      "lockedUntil": string | null;
      "deletedAt": string | null;
      "createdAt": string;
      "updatedAt": string;
    };
    "AccountEmailDTO": 
    {
      "id": string;
      "accountId": string;
      "email": string;
      "type": "primary" | "backup";
      "verifiedAt": string | null;
      "createdAt": string;
    };
    "ProfileDTO": 
    {
      "userId"?: string;
      "username": string;
      "displayName": string | null;
      "avatarUrl": string | null;
      "headline": string | null;
      "bio": string | null;
      "location": string | null;
      "portfolioUrl": string | null;
      "githubUrl": string | null;
      "linkedinUrl": string | null;
      "twitterUrl": string | null;
    };
    "AccountPreferencesDTO": 
    {
      "userId": string;
      "locale": "pt" | "en" | "es" | null;
      "profileVisibility": "public" | "private";
    };
    "AccountDetailsDTO": 
    {
      "account": components["schemas"]["AccountSummaryDTO"];
      "emails": components["schemas"]["AccountEmailDTO"][];
      "profile": components["schemas"]["ProfileDTO"];
      "preferences": components["schemas"]["AccountPreferencesDTO"];
      "role": "curator" | "admin" | "moderator" | null;
    };
    "PublicProfileContributionDTO": 
    {
      "id": string;
      "type": "article" | "project" | "question" | "answer" | "resource" | "job";
      "title": string;
      "slug": string | null;
      "parentId": string | null;
      "occurredAt": string | null;
      "contributionCount": number | null;
    };
    "PublicProfileOrganizationDTO": 
    {
      "id": string;
      "name": string;
      "slug": string;
      "type": string;
      "avatarUrl": string | null;
      "membershipRole": "owner" | "admin" | "member";
    };
    "PublicProfileDTO": 
    {
      "userId"?: string;
      "username": string;
      "displayName": string | null;
      "avatarUrl": string | null;
      "headline": string | null;
      "bio": string | null;
      "location": string | null;
      "portfolioUrl": string | null;
      "githubUrl": string | null;
      "linkedinUrl": string | null;
      "twitterUrl": string | null;
      "contributions": components["schemas"]["PublicProfileContributionDTO"][];
      "organizations": components["schemas"]["PublicProfileOrganizationDTO"][];
    };
    "UpdateProfileDTO": 
    {
      "username"?: string;
      "displayName"?: string | null;
      "headline"?: string | null;
      "bio"?: string | null;
      "location"?: string | null;
      "avatarMediaId"?: string | null;
      "portfolioUrl"?: string | null;
      "githubUrl"?: string | null;
      "linkedinUrl"?: string | null;
      "twitterUrl"?: string | null;
    };
    "UpdateAccountPreferencesDTO": 
    {
      "locale"?: "pt" | "en" | "es" | null;
      "profileVisibility"?: "public" | "private";
    };
    "SuspendAccountDTO": 
    {
      "lockedUntil"?: string;
    };
    "AccountRoleAssignmentDTO": 
    {
      "userId": string;
      "role": "curator" | "admin" | "moderator" | null;
    };
    "AssignAccountRolesDTO": 
    {
      "role": "curator" | "admin" | "moderator" | null;
    };
    "AccountAdminUserDTO": 
    {
      "id": string;
      "voluntaryStatus": "active" | "deactivated";
      "moderationStatus": "none" | "suspended" | "banned";
      "deletionStatus": "none" | "pending";
      "deletionRequestedAt": string | null;
      "status": "active" | "deactivated" | "suspended" | "banned";
      "mfaEnabled": boolean;
      "lockedUntil": string | null;
      "email": 
    {

    } | null;
      "username": 
    {

    } | null;
      "role": "curator" | "admin" | "moderator" | null;
      "createdAt": string;
    };
    "AccountAdminUsersPageDTO": 
    {
      "data": components["schemas"]["AccountAdminUserDTO"][];
      "total": number;
      "page": number;
      "pageSize": number;
    };
    "GenericPublicAckDTO": 
    {
      "acknowledged": boolean;
    };
    "EmailChangeDTO": 
    {
      "email": string;
    };
    "GenericAuthenticatedAckDTO": 
    {
      "acknowledged": boolean;
    };
    "EmailVerifiedDTO": 
    {
      "email": string;
      "type": "primary" | "backup";
      "verifiedAt": string;
    };
    "EmailTokenDTO": 
    {
      "token": string;
    };
    "EmailChangeCompletedDTO": 
    {
      "email": string;
      "type": "primary" | "backup";
      "verifiedAt": string;
    };
    "AccountRecoveryStartDTO": 
    {
      "email": string;
    };
    "AccountRecoveredDTO": 
    {
      "recovered": boolean;
    };
    "AccountRecoveryCompleteDTO": 
    {
      "token": string;
    };
    "StartMagicLinkLoginDTO": 
    {
      "email": string;
      "redirect"?: string | null;
    };
    "MagicLinkLoginDTO": 
    {
      "mfaRequired"?: boolean;
      "token"?: string;
      "methods"?: string[];
      "reactivationToken"?: string;
      "redirect"?: 
    {

    } | null;
      "restoreAccessRequested"?: boolean;
    };
    "CompleteMagicLinkLoginDTO": 
    {
      "token": string;
    };
    "MfaConfigurationDTO": 
    {
      "enabled": boolean;
      "totpEnrolled": boolean;
      "totpStatus": "pending" | "active" | "disabled" | null;
      "recoveryCodesRemaining": number;
    };
    "MfaTotpEnrollStartDTO": 
    {
      "secret": string;
      "otpauthUri": string;
      "status": "pending";
    };
    "MfaTotpEnrollCompleteResponseDTO": 
    {
      "recoveryCodes": string[];
    };
    "MfaTotpEnrollCompleteDTO": 
    {
      "code": string;
    };
    "MfaDisableDTO": 
    {
      "method": "totp" | "recovery_code";
      "code": string;
    };
    "MfaTotpVerifyDTO": 
    {
      "token": string;
      "code": string;
      "deviceName"?: string;
    };
    "MfaRecoveryCodeSessionDTO": 
    {
      "recoveryCodeUsed": boolean;
      "remainingCodes": number;
    };
    "MfaRecoveryCodeVerifyDTO": 
    {
      "token": string;
      "recoveryCode": string;
      "deviceName"?: string;
    };
    "MfaRecoveryCodesDTO": 
    {
      "recoveryCodes": string[];
    };
    "OAuthAuthorizationDTO": 
    {
      "url": string;
      "stateToken": string;
    };
    "OAuthLoginDTO": 
    {
      "mfaRequired"?: boolean;
      "token"?: string;
      "methods"?: string[];
      "reactivationToken"?: string;
      "restoreAccessRequested"?: boolean;
    };
    "CompleteOAuthLoginDTO": 
    {
      "code": string;
      "stateToken": string;
    };
    "OAuthCredentialLinkedDTO": 
    {
      "credentialId": string;
    };
    "CompleteOAuthLinkDTO": 
    {
      "code": string;
      "stateToken": string;
    };
    "AuthenticationMethodDTO": 
    {
      "id": string;
      "provider": "local" | "google" | "github" | "passkey";
      "providerEmail": string | null;
      "createdAt": string;
      "canRemove": boolean;
    };
    "PasskeyDeviceDTO": 
    {
      "credentialId": string;
      "deviceName": string | null;
      "deviceType": string;
      "backedUp": boolean;
      "transports": string[] | null;
      "createdAt": string;
      "updatedAt": string;
      "lastUsedAt": string | null;
    };
    "PasskeyChallengeDTO": 
    {
      "options": 
    {
      [key: string]: unknown;

    };
      "stateToken": string;
    };
    "PasskeyLoginDTO": 
    {
      "mfaRequired"?: boolean;
      "token"?: string;
      "methods"?: string[];
      "reactivationToken"?: string;
      "restoreAccessRequested"?: boolean;
    };
    "CompletePasskeyLoginDTO": 
    {
      "stateToken": string;
      "response": 
    {
      [key: string]: unknown;

    };
      "deviceName"?: string;
    };
    "PasskeyRegisteredDTO": 
    {
      "credentialId": string;
    };
    "CompletePasskeyRegistrationDTO": 
    {
      "stateToken": string;
      "response": 
    {
      [key: string]: unknown;

    };
      "deviceName"?: string;
    };
    "UpdatePasskeyDeviceNameDTO": 
    {
      "deviceName": string;
    };
    "PossessionProofStartedDTO": 
    {
      "sent": boolean;
      "mfaRequired"?: true;
    };
    "PossessionProofRequirementResultDTO": 
    {
      "accepted": boolean;
      "required": boolean;
    };
    "PossessionProofCompleteDTO": 
    {
      "emailCode"?: string;
      "mfaMethod"?: "totp" | "recovery_code";
      "mfaCode"?: string;
    };
    "PasswordRegisterStartResponseDTO": 
    {
      "registrationResponse": string;
      "opaqueUserIdentifier": string;
    };
    "PasswordRegisterStartDTO": 
    {
      "email": string;
      "registrationRequest": string;
    };
    "PasswordRegistrationCompletedDTO": 
    {
      "acknowledged": true;
    };
    "PasswordRegisterFinishDTO": 
    {
      "email": string;
      "registrationRecord": string;
      "opaqueUserIdentifier": string;
    };
    "PasswordLoginStartResponseDTO": 
    {
      "serverLoginState": string;
      "loginResponse": string;
    };
    "PasswordLoginStartDTO": 
    {
      "email": string;
      "startLoginRequest": string;
    };
    "PasswordLoginCompleteDTO": 
    {
      "mfaRequired"?: boolean;
      "token"?: string;
      "methods"?: string[];
      "emailVerificationRequested"?: boolean;
      "reactivationToken"?: string;
      "restoreAccessRequested"?: boolean;
    };
    "PasswordLoginFinishDTO": 
    {
      "email": string;
      "serverLoginState": string;
      "finishLoginRequest": string;
      "deviceName"?: string;
    };
    "PasswordRecoverStartDTO": 
    {
      "email": string;
    };
    "PasswordRecoveryCompletedDTO": 
    {
      "recovered": boolean;
    };
    "PasswordRecoverCompleteDTO": 
    {
      "token": string;
      "registrationRecord": string;
    };
    "PasswordRecoverPrepareResponseDTO": 
    {
      "registrationResponse": string;
    };
    "PasswordRecoverPrepareDTO": 
    {
      "token": string;
      "registrationRequest": string;
    };
    "PasswordChangeStartResponseDTO": 
    {
      "changeToken": string;
      "registrationResponse": string;
    };
    "PasswordChangeStartDTO": 
    {
      "registrationRequest": string;
      "serverLoginState": string;
      "finishLoginRequest": string;
    };
    "PasswordChangedDTO": 
    {
      "changed": boolean;
    };
    "PasswordChangeCompleteDTO": 
    {
      "changeToken": string;
      "registrationRecord": string;
    };
    "PasswordCredentialCreateStartDTO": 
    {
      "registrationRequest": string;
    };
    "PasswordCredentialCreatedDTO": 
    {
      "credentialId": string;
    };
    "PasswordCredentialCreateCompleteDTO": 
    {
      "registrationRecord": string;
      "opaqueUserIdentifier": string;
    };
    "SessionDTO": 
    {
      "id": string;
      "userId": string;
      "credentialId"?: string | null;
      "authMethod": "password" | "oauth" | "passkey" | "magic_link" | "restore_access";
      "ipAddress"?: string | null;
      "userAgent"?: string | null;
      "deviceName"?: string | null;
      "lastProofOfPossessionAt": string;
      "createdAt": string;
      "expiresAt": string;
      "revokedAt"?: string | null;
    };
    "SessionListDTO": 
    {
      "items": components["schemas"]["SessionDTO"][];
    };
    "SessionOrMfaChallengeDTO": 
    {
      "mfaRequired"?: true;
      "token"?: string;
      "methods"?: string[];
    };
    "AccountReactivationDTO": 
    {
      "token": string;
    };
    "AccountDeletionRestoreAccessDTO": 
    {
      "token": string;
    };
    "MediaUploadGrantDTO": 
    {
      "mediaId": string;
      "uploadUrl": string;
      "expiresInSeconds": number;
      "expiresAt": string;
    };
    "RequestMediaUploadDTO": 
    {
      "purpose": "avatar" | "content";
      "contentType": "image/webp";
      "sizeBytes": number;
      "expiresInSeconds"?: number;
    };
    "ConfirmedMediaUploadDTO": 
    {
      "mediaId": string;
      "url": 
    {

    } | null;
    };
    "ConfirmMediaUploadDTO": 
    {
      "purpose": "avatar" | "content";
      "mediaId": string;
    };
    "NotificationDTO": 
    {
      "id": string;
      "accountId": string;
      "type": string;
      "targetType"?: string | null;
      "targetId"?: string | null;
      "sourceType"?: string | null;
      "sourceId"?: string | null;
      "seenAt": string | null;
      "readAt": string | null;
      "createdAt": string;
    };
    "SyncNotificationsDTO": 
    {
      "items": components["schemas"]["NotificationDTO"][];
      "nextCursor": string | null;
      "unreadCount": number;
    };
    "MarkAllNotificationsReadResultDTO": 
    {
      "updated": number;
    };
    "VoteSetResultDTO": 
    {
      "resourceId": string;
      "active": boolean;
    };
    "SyncedVoteDTO": 
    {
      "resourceId": string;
      "active": boolean;
      "updatedAt": string;
    };
    "SyncMyVotesDTO": 
    {
      "items": components["schemas"]["SyncedVoteDTO"][];
      "syncedThrough": string;
    };
    "BookmarkDTO": 
    {
      "accountId": string;
      "resourceId": string;
      "active": boolean;
      "createdAt": string;
      "updatedAt": string;
    };
    "SyncMyBookmarksDTO": 
    {
      "items": components["schemas"]["BookmarkDTO"][];
      "syncedThrough": string;
    };
    "ViewResultDTO": 
    {
      "resourceId": string;
      "views": number;
    };
    "AuthorDTO": 
    {
      "username": string;
      "displayName": string;
      "avatarUrl": string;
    };
    "CommentDTO": 
    {
      "id": string;
      "resourceId": string;
      "author": components["schemas"]["AuthorDTO"];
      "parentId": string | null;
      "content": string | null;
      "createdAt": string;
      "editedAt": string | null;
      "hiddenAt": string | null;
      "deletedAt": string | null;
      "children"?: components["schemas"]["CommentDTO"][];
    };
    "UpdateCommentDTO": 
    {
      "content": string;
    };
    "CommentCreatedDTO": 
    {
      "id": string;
      "resourceId": string;
      "author": components["schemas"]["AuthorDTO"];
      "parentId": string | null;
      "content": string | null;
      "createdAt": string;
      "editedAt": string | null;
      "hiddenAt": string | null;
      "deletedAt": string | null;
      "children"?: components["schemas"]["CommentDTO"][];
    };
    "CreateCommentDTO": 
    {
      "parentId"?: string;
      "content": string;
    };
    "AccountRestrictionDTO": 
    {
      "id": string;
      "accountId": string;
      "capability": "CONTRIBUTION" | "COMMENT" | "VOTE" | "JOB_PUBLISH";
      "reason": string;
      "startsAt": string;
      "endsAt"?: string | null;
      "appliedByAccountId": string;
      "revokedAt"?: string | null;
      "revokedByAccountId"?: string | null;
      "revokeReason"?: string | null;
      "createdAt": string;
    };
    "GetAccountStandingOutputDTO": 
    {
      "accountId": string;
      "standing": "clear" | "restricted";
      "restrictions": components["schemas"]["AccountRestrictionDTO"][];
    };
    "RestrictAccountCapabilityOutputDTO": 
    {
      "id": string;
      "accountId": string;
      "capability": "CONTRIBUTION" | "COMMENT" | "VOTE" | "JOB_PUBLISH";
      "reason": string;
      "startsAt": string;
      "endsAt"?: string | null;
      "appliedByAccountId": string;
      "revokedAt"?: string | null;
      "revokedByAccountId"?: string | null;
      "revokeReason"?: string | null;
      "createdAt": string;
    };
    "RestrictAccountCapabilityInputDTO": 
    {
      "capability": "CONTRIBUTION" | "COMMENT" | "VOTE" | "JOB_PUBLISH";
      "reason": string;
      "startsAt": string;
      "endsAt"?: 
    {

    } | null;
    };
    "RevokeAccountRestrictionOutputDTO": 
    {
      "id": string;
      "accountId": string;
      "capability": "CONTRIBUTION" | "COMMENT" | "VOTE" | "JOB_PUBLISH";
      "reason": string;
      "startsAt": string;
      "endsAt"?: string | null;
      "appliedByAccountId": string;
      "revokedAt"?: string | null;
      "revokedByAccountId"?: string | null;
      "revokeReason"?: string | null;
      "createdAt": string;
    };
    "RevokeAccountRestrictionInputDTO": 
    {
      "reason": string;
    };
    "ContentTagDTO": 
    {
      "name": string;
      "slug": string;
    };
    "ArticleItemDTO": 
    {
      "id": string;
      "authorAccountId": string | null;
      "author"?: components["schemas"]["AuthorDTO"];
      "title": string;
      "description": string;
      "slug": string;
      "coverImageUrl"?: string | null;
      "tags": components["schemas"]["ContentTagDTO"][];
      "readingTimeMinutes": number;
      "votes": number;
      "views": number;
      "commentCount": number;
      "status": "draft" | "published" | "archived";
      "publishedAt": string | null;
      "hiddenAt": string | null;
      "hideReason": string | null;
      "updatedAt": string;
      "deletedAt": string | null;
    };
    "ArticlePopularTagDTO": 
    {
      "slug": string;
      "name": string;
      "articleCount": number;
    };
    "ArticleDTO": 
    {
      "id": string;
      "authorAccountId": string | null;
      "author"?: components["schemas"]["AuthorDTO"];
      "title": string;
      "description": string;
      "slug": string;
      "coverImageUrl"?: string | null;
      "tags": components["schemas"]["ContentTagDTO"][];
      "readingTimeMinutes": number;
      "votes": number;
      "views": number;
      "commentCount": number;
      "status": "draft" | "published" | "archived";
      "publishedAt": string | null;
      "hiddenAt": string | null;
      "hideReason": string | null;
      "updatedAt": string;
      "deletedAt": string | null;
    };
    "ArticleContentDTO": 
    {
      "id": string;
      "content": string;
      "contentVersion": number;
    };
    "SaveArticleDraftOutputDTO": 
    {
      "id": string;
      "authorAccountId": string | null;
      "author"?: components["schemas"]["AuthorDTO"];
      "title": string;
      "description": string;
      "slug": string;
      "coverImageUrl"?: string | null;
      "tags": components["schemas"]["ContentTagDTO"][];
      "readingTimeMinutes": number;
      "votes": number;
      "views": number;
      "commentCount": number;
      "status": "draft" | "published" | "archived";
      "publishedAt": string | null;
      "hiddenAt": string | null;
      "hideReason": string | null;
      "updatedAt": string;
      "deletedAt": string | null;
    };
    "SaveArticleDraftInputDTO": 
    {
      "title": string;
      "description": string;
      "coverMediaId"?: string | null;
      "content": string;
      "tagSlugs": string[];
    };
    "ArticlePublishInputDTO": 
    {
      "publishedAt"?: string;
    };
    "SetArticleCommentsEnabledDTO": 
    {
      "enabled": boolean;
    };
    "UpdateArticleDTO": 
    {
      "title"?: string;
      "description"?: string;
      "coverMediaId"?: string | null;
      "contentPatch"?: string;
      "baseContentVersion"?: number;
      "tagSlugs"?: string[];
    };
    "NewsItemDTO": 
    {
      "id": string;
      "title": string;
      "description": string;
      "slug": string;
      "coverImageUrl"?: string | null;
      "tags": components["schemas"]["ContentTagDTO"][];
      "views": number;
      "occurredAt": string | null;
      "status": "draft" | "published" | "archived";
      "publishedAt": string | null;
      "updatedAt": string;
      "deletedAt": string | null;
    };
    "NewsSourceDTO": 
    {
      "id": string;
      "name": string;
      "domain": string;
      "newsCount": number;
    };
    "NewsSuggestionDTO": 
    {
      "id": string;
      "url": string;
      "submittedByAccountId": 
    {

    } | null;
      "status": string;
      "newsId": 
    {

    } | null;
      "createdAt": string;
      "resolvedAt": 
    {

    } | null;
    };
    "SubmitNewsSuggestionDTO": 
    {
      "url": string;
    };
    "AcceptNewsSuggestionDTO": 
    {
      "newsId"?: string;
      "title"?: string;
      "description"?: string;
      "content"?: string;
    };
    "NewsDTO": 
    {
      "id": string;
      "title": string;
      "description": string;
      "slug": string;
      "coverImageUrl"?: string | null;
      "content": string;
      "contentVersion": number;
      "tags": components["schemas"]["ContentTagDTO"][];
      "views": number;
      "occurredAt": string | null;
      "status": "draft" | "published" | "archived";
      "publishedAt": string | null;
      "updatedAt": string;
      "deletedAt": string | null;
    };
    "SaveNewsDraftOutputDTO": 
    {
      "id": string;
      "title": string;
      "description": string;
      "slug": string;
      "coverImageUrl"?: string | null;
      "content": string;
      "contentVersion": number;
      "tags": components["schemas"]["ContentTagDTO"][];
      "views": number;
      "occurredAt": string | null;
      "status": "draft" | "published" | "archived";
      "publishedAt": string | null;
      "updatedAt": string;
      "deletedAt": string | null;
    };
    "SaveNewsDraftInputDTO": 
    {
      "sourceUrls"?: string[];
      "occurredAt"?: string | null;
      "title": string;
      "description": string;
      "coverMediaId"?: string | null;
      "content": string;
      "tagSlugs": string[];
    };
    "SetNewsCommentsEnabledDTO": 
    {
      "enabled": boolean;
    };
    "UpdateNewsDTO": 
    {
      "occurredAt"?: string | null;
      "title"?: string;
      "description"?: string;
      "coverMediaId"?: string | null;
      "contentPatch"?: string;
      "baseContentVersion"?: number;
      "tagSlugs"?: string[];
    };
    "ResourceItemDTO": 
    {
      "id": string;
      "status": string;
      "deletedAt"?: string | null;
      "title": string;
      "description": string;
      "url": string;
      "tags": components["schemas"]["ContentTagDTO"][];
      "votes": number;
    };
    "ExternalResourceSuggestionDTO": 
    {
      "id": string;
      "acceptedExternalResourceId": 
    {

    } | null;
      "submittedByAccountId": 
    {

    } | null;
      "url": string;
      "status": string;
      "decisionNote": 
    {

    } | null;
      "decidedByAccountId": 
    {

    } | null;
      "decidedAt": 
    {

    } | null;
      "createdAt": string;
    };
    "CreateResourceDTO": 
    {
      "title": string;
      "description": string;
      "url": string;
      "tagSlugs": string[];
    };
    "SuggestExternalResourceDTO": 
    {
      "url": string;
    };
    "ApproveExternalResourceSuggestionDTO": 
    {
      "title": string;
      "description": string;
      "tagSlugs"?: string[];
    };
    "RejectResourceDTO": 
    {
      "decisionNote"?: string;
    };
    "UpdateResourceDTO": 
    {
      "title"?: string;
      "description"?: string;
      "url"?: string;
      "tagSlugs"?: string[];
    };
    "TagAliasDTO": 
    {
      "id": string;
      "tagId": string;
      "alias": string;
      "createdAt": string;
    };
    "CreateTagAliasDTO": 
    {
      "tagId": string;
      "alias": string;
    };
    "TagIdentityTermDTO": 
    {
      "id": string;
      "value": string;
      "kind": "reserved" | "blocked";
      "createdAt": string;
      "updatedAt": string;
    };
    "SetTagIdentityTermDTO": 
    {
      "value": string;
      "kind": "reserved" | "blocked";
    };
    "TagDTO": 
    {
      "id": string;
      "name": string;
      "slug": string;
      "status": "active" | "archived";
      "createdAt": string;
      "updatedAt": string;
    };
    "CreateTagDTO": 
    {
      "name": string;
      "slug": string;
    };
    "UpdateTagDTO": 
    {
      "id"?: string;
      "name"?: string;
      "slug"?: string;
    };
    "MergeTagsDTO": 
    {
      "sourceTagId": string;
      "targetTagId": string;
    };
    "DiscoveryItemDTO": 
    {
      "type": "article" | "news" | "resource" | "question" | "project" | "job" | "event";
      "id": string;
      "slug": string;
      "title": string;
      "summary": string;
      "publishedAt": 
    {

    } | null;
      "relevanceScore": number;
    };
    "SearchExploreOutputDTO": 
    {
      "items": components["schemas"]["DiscoveryItemDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    "GetFeedOutputDTO": 
    {
      "items": components["schemas"]["DiscoveryItemDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    "ListTrendingContentOutputDTO": 
    {
      "items": components["schemas"]["DiscoveryItemDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    "ListPopularContentOutputDTO": 
    {
      "items": components["schemas"]["DiscoveryItemDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    "ListRecentContentOutputDTO": 
    {
      "items": components["schemas"]["DiscoveryItemDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    "GetRelatedContentOutputDTO": 
    {
      "items": components["schemas"]["DiscoveryItemDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    "AccountProfileSummaryDTO": 
    {
      "username": string;
      "displayName": string;
      "avatarUrl": string | null;
    };
    "QuestionItemDTO": 
    {
      "id": string;
      "authorAccountId": 
    {

    } | null;
      "author": components["schemas"]["AccountProfileSummaryDTO"];
      "title": string;
      "tagSlugs": string[];
      "status": "open" | "closed";
      "acceptedAnswerId": 
    {

    } | null;
      "answerCount": number;
      "createdAt": string;
    };
    "PaginatedQuestionsDTO": 
    {
      "items": components["schemas"]["QuestionItemDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    "QAndAAccountContributionDTO": 
    {
      "id": string;
      "type": "question" | "answer";
      "title": string;
      "parentId": 
    {

    } | null;
      "occurredAt": string;
      "hiddenAt": 
    {

    } | null;
    };
    "AnswerDTO": 
    {
      "id": string;
      "questionId": string;
      "authorAccountId": 
    {

    } | null;
      "author": components["schemas"]["AccountProfileSummaryDTO"];
      "content": string;
      "acceptedAt": 
    {

    } | null;
      "hiddenAt": 
    {

    } | null;
      "deletedAt": 
    {

    } | null;
      "votes": number;
      "createdAt": string;
    };
    "QuestionDTO": 
    {
      "id": string;
      "authorAccountId": 
    {

    } | null;
      "author": components["schemas"]["AccountProfileSummaryDTO"];
      "title": string;
      "content": string;
      "tagSlugs": string[];
      "status": "open" | "closed";
      "acceptedAnswerId": 
    {

    } | null;
      "hiddenAt": 
    {

    } | null;
      "deletedAt": 
    {

    } | null;
      "answers": components["schemas"]["AnswerDTO"][];
      "createdAt": string;
    };
    "CreateQuestionDTO": 
    {
      "title": string;
      "content": string;
      "tagSlugs": string[];
    };
    "CreateAnswerDTO": 
    {
      "content": string;
    };
    "JobDTO": 
    {
      "id": string;
      "publicationType": "organization" | "community";
      "publisherOrganizationId": string | null;
      "publisher": 
    {

    } | null;
      "title": string;
      "description": string;
      "employmentType": "full_time" | "part_time" | "contract" | "internship" | "temporary";
      "workplaceType": "remote" | "hybrid" | "onsite";
      "location": string | null;
      "compensationMin": string | null;
      "compensationMax": string | null;
      "compensationCurrency": string | null;
      "compensationUnit": "hourly" | "daily" | "monthly" | "yearly" | "fixed_project" | null;
      "applicationUrl": string;
      "sourceUrl": string | null;
      "tagSlugs": string[];
      "status": "published" | "closed" | "expired" | "withdrawn";
      "publishedAt": string;
      "expiresAt": string;
      "closedAt": string | null;
      "withdrawnAt": string | null;
      "hiddenAt": string | null;
      "createdAt": string;
      "updatedAt": string;
    };
    "PaginatedJobsDTO": 
    {
      "items": components["schemas"]["JobDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    "SaveJobDTO": 
    {
      "title": string;
      "publisherOrganizationId": string;
      "description": string;
      "employmentType": "full_time" | "part_time" | "contract" | "internship" | "temporary";
      "workplaceType": "remote" | "hybrid" | "onsite";
      "location"?: string | null;
      "compensationMin"?: number | null;
      "compensationMax"?: number | null;
      "compensationCurrency"?: string | null;
      "compensationUnit"?: "hourly" | "daily" | "monthly" | "yearly" | "fixed_project" | null;
      "applicationUrl": string;
      "sourceUrl"?: 
    {

    };
      "tagSlugs": string[];
    };
    "SubmitCommunityJobDTO": 
    {
      "title": string;
      "description": string;
      "employmentType": "full_time" | "part_time" | "contract" | "internship" | "temporary";
      "workplaceType": "remote" | "hybrid" | "onsite";
      "location"?: string | null;
      "compensationMin"?: number | null;
      "compensationMax"?: number | null;
      "compensationCurrency"?: string | null;
      "compensationUnit"?: "hourly" | "daily" | "monthly" | "yearly" | "fixed_project" | null;
      "applicationUrl": string;
      "sourceUrl"?: 
    {

    };
      "tagSlugs": string[];
    };
    "UpdateJobDTO": 
    {
      "title": string;
      "description": string;
      "employmentType": "full_time" | "part_time" | "contract" | "internship" | "temporary";
      "workplaceType": "remote" | "hybrid" | "onsite";
      "location"?: string | null;
      "compensationMin"?: number | null;
      "compensationMax"?: number | null;
      "compensationCurrency"?: string | null;
      "compensationUnit"?: "hourly" | "daily" | "monthly" | "yearly" | "fixed_project" | null;
      "applicationUrl": string;
      "sourceUrl"?: 
    {

    };
      "tagSlugs": string[];
    };
    "ProjectDTO": 
    {
      "id": string;
      "authorAccountId": string;
      "author": components["schemas"]["AccountProfileSummaryDTO"];
      "title": string;
      "slug": string;
      "summary": string;
      "description": string;
      "tagSlugs": string[];
      "projectUrl": string | null;
      "repositoryUrl": string | null;
      "status": "draft" | "published" | "archived";
      "publishedAt": string | null;
      "hiddenAt": string | null;
      "createdAt": string;
      "updatedAt": string;
    };
    "PaginatedProjectsDTO": 
    {
      "items": components["schemas"]["ProjectDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    "SaveProjectDTO": 
    {
      "title": string;
      "summary": string;
      "description": string;
      "projectUrl"?: string | null;
      "repositoryUrl"?: string | null;
      "tagSlugs": string[];
    };
    "UpdateProjectDTO": 
    {
      "title": string;
      "summary": string;
      "description": string;
      "projectUrl"?: string | null;
      "repositoryUrl"?: string | null;
      "tagSlugs": string[];
    };
    "EventDTO": 
    {
      "id": string;
      "slug": string;
      "status": "draft" | "published" | "archived";
      "title": string;
      "description": string;
      "coverMediaId": string | null;
      "url": string;
      "startsAt": string;
      "endsAt": string;
      "format": "online" | "in_person" | "hybrid";
      "location": string | null;
      "publishedAt": string | null;
      "deletedAt": string | null;
      "temporalState": string | null;
      "createdAt": string;
      "updatedAt": string;
    };
    "PaginatedEventsDTO": 
    {
      "items": components["schemas"]["EventDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    "CreateEventDTO": 
    {
      "title": string;
      "description": string;
      "url": string;
      "startsAt": string;
      "endsAt": string;
      "format": "online" | "in_person" | "hybrid";
      "location"?: 
    {

    } | null;
      "coverMediaId"?: 
    {

    } | null;
    };
    "SubmitEventSuggestionDTO": 
    {
      "url": string;
    };
    "AcceptEventSuggestionDTO": 
    {
      "title": string;
      "description": string;
      "url": string;
      "startsAt": string;
      "endsAt": string;
      "format": "online" | "in_person" | "hybrid";
      "location"?: 
    {

    } | null;
      "coverMediaId"?: 
    {

    } | null;
    };
    "RejectEventDTO": 
    {
      "reason": string;
    };
    "UpdateEventDTO": 
    {
      "title": string;
      "description": string;
      "url": string;
      "startsAt": string;
      "endsAt": string;
      "format": "online" | "in_person" | "hybrid";
      "location"?: 
    {

    } | null;
      "coverMediaId"?: 
    {

    } | null;
    };
    "ReviewEventDTO": 
    {
      "status": "published" | "archived";
    };
    "OrganizationDTO": 
    {
      "id": string;
      "name": string;
      "slug": string;
      "type": "company" | "community" | "open_source" | "foundation" | "group" | "institution" | "other";
      "description": string;
      "websiteUrl"?: string | null;
      "avatarUrl"?: string | null;
      "createdByAccountId": string;
      "status": "active" | "archived";
      "createdAt": string;
      "updatedAt": string;
    };
    "PaginatedOrganizationsDTO": 
    {
      "items": components["schemas"]["OrganizationDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    "CreateOrganizationDTO": 
    {
      "name": string;
      "type": "company" | "community" | "open_source" | "foundation" | "group" | "institution" | "other";
      "description": string;
      "websiteUrl"?: string | null;
      "avatarUrl"?: string | null;
    };
    "MyOrganizationDTO": 
    {
      "id": string;
      "name": string;
      "slug": string;
      "type": "company" | "community" | "open_source" | "foundation" | "group" | "institution" | "other";
      "description": string;
      "websiteUrl"?: string | null;
      "avatarUrl"?: string | null;
      "createdByAccountId": string;
      "status": "active" | "archived";
      "createdAt": string;
      "updatedAt": string;
      "membershipRole": "owner" | "admin" | "member";
    };
    "UpdateOrganizationDTO": 
    {
      "name": string;
      "type": "company" | "community" | "open_source" | "foundation" | "group" | "institution" | "other";
      "description": string;
      "websiteUrl"?: string | null;
      "avatarUrl"?: string | null;
    };
    "OrganizationMembershipDTO": 
    {
      "organizationId": string;
      "accountId": string;
      "role": "owner" | "admin" | "member";
      "username": string | null;
      "displayName": string | null;
      "avatarUrl": string | null;
      "createdAt": string;
      "updatedAt": string;
    };
    "AddOrganizationMemberDTO": 
    {
      "accountId": string;
      "role": "owner" | "admin" | "member";
    };
    "ChangeOrganizationMemberRoleDTO": 
    {
      "role": "owner" | "admin" | "member";
    };
    "CreateResourceReportDTO": 
    {
      "reason": string;
      "description"?: string;
    };
    "CreateCommentReportDTO": 
    {
      "reason": string;
      "description"?: string;
    };
    "ReviewReportDTO": 
    {
      "decision": "resolved" | "dismissed";
      "note"?: string;
    };
    "HealthStatusDTO": 
    {
      "status": string;
      "timestamp": string;
    };
    "ReadinessStatusDTO": 
    {
      "status": string;
      "ready": boolean;
      "timestamp": string;
    };
    "SubmitContactMessageOutputDTO": 
    {
      "accepted": boolean;
    };
    "SubmitContactMessageInputDTO": 
    {
      "type": "institutional" | "legal" | "support";
      "name"?: string;
      "email": string;
      "subject": string;
      "message": string;
      "contextUrl"?: string;
    };
    "SubmitFeedbackDTO": 
    {
      "category": "bug" | "issue" | "suggestion";
      "description": string;
      "contextUrl"?: string;
      "screenshotMediaId"?: string;
    };
    "FeedbackDTO": 
    {
      "id": string;
      "reporterAccountId": 
    {

    } | null;
      "category": "bug" | "issue" | "suggestion";
      "description": string;
      "contextUrl"?: 
    {

    } | null;
      "screenshotMediaId"?: 
    {

    } | null;
      "status": "open" | "in_review" | "resolved" | "dismissed";
      "internalSeverity"?: 
    {

    } | null;
      "createdAt": string;
      "resolvedAt"?: 
    {

    } | null;
    };
    "UpdateFeedbackStatusDTO": 
    {
      "status": "open" | "in_review" | "resolved" | "dismissed";
      "internalSeverity"?: 
    {

    } | null;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export interface operations {
  "ScheduledJobsController_run_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "204": { headers: { [name: string]: unknown }; content: Record<string, never> };
    };
  };
  "AccountController_getMe_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CURRENT_USER_RETRIEVED";
      "data"?: components["schemas"]["AccountShellDTO"];
    } } };
    };
  };
  "AccountController_deleteMe_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ACCOUNT_DELETED";
      "data"?: unknown | null;
    } } };
    };
  };
  "AccountController_getMyDetails_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CURRENT_USER_RETRIEVED";
      "data"?: components["schemas"]["AccountDetailsDTO"];
    } } };
    };
  };
  "AccountController_deactivateMe_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ACCOUNT_DEACTIVATED";
      "data"?: unknown | null;
    } } };
    };
  };
  "ProfilesController_getMeProfile_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PROFILE_RETRIEVED";
      "data"?: components["schemas"]["ProfileDTO"];
    } } };
    };
  };
  "ProfilesController_updateMeProfile_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["UpdateProfileDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PROFILE_UPDATED";
      "data"?: components["schemas"]["ProfileDTO"];
    } } };
    };
  };
  "ProfilesController_getByUsername_v1": {
    parameters: { query?: never; header?: never; path?: { "username": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PROFILE_RETRIEVED";
      "data"?: components["schemas"]["PublicProfileDTO"];
    } } };
    };
  };
  "MePreferencesController_getPreferences_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PREFERENCES_RETRIEVED";
      "data"?: components["schemas"]["AccountPreferencesDTO"];
    } } };
    };
  };
  "MePreferencesController_updatePreferences_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["UpdateAccountPreferencesDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PREFERENCES_UPDATED";
      "data"?: components["schemas"]["AccountPreferencesDTO"];
    } } };
    };
  };
  "AccountAdminController_suspend_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["SuspendAccountDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "USER_SUSPENDED";
      "data"?: unknown | null;
    } } };
    };
  };
  "AccountAdminController_unsuspend_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "USER_UNSUSPENDED";
      "data"?: unknown | null;
    } } };
    };
  };
  "AccountAdminController_ban_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "USER_BANNED";
      "data"?: unknown | null;
    } } };
    };
  };
  "AccountAdminController_unban_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "USER_UNBANNED";
      "data"?: unknown | null;
    } } };
    };
  };
  "AccountAdminController_assignRoles_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["AssignAccountRolesDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "USER_ROLES_UPDATED";
      "data"?: components["schemas"]["AccountRoleAssignmentDTO"];
    } } };
    };
  };
  "AccountAdminController_listAccounts_v1": {
    parameters: { query?: { "page"?: number; "pageSize"?: number }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "USERS_LISTED";
      "data"?: components["schemas"]["AccountAdminUsersPageDTO"];
    } } };
    };
  };
  "AccountAdminController_getAccount_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "USER_RETRIEVED";
      "data"?: unknown | null;
    } } };
    };
  };
  "AuthEmailsController_resendEmailVerification_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["EmailChangeDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "EMAIL_VERIFICATION_RESENT";
      "data"?: components["schemas"]["GenericPublicAckDTO"];
    } } };
    };
  };
  "AuthEmailsController_startEmailVerification_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "EMAIL_VERIFICATION_STARTED";
      "data"?: components["schemas"]["GenericAuthenticatedAckDTO"];
    } } };
    };
  };
  "AuthEmailsController_completeEmailVerification_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["EmailTokenDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "EMAIL_VERIFIED";
      "data"?: components["schemas"]["EmailVerifiedDTO"];
    } } };
    };
  };
  "AuthEmailsController_startPrimaryEmailChange_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["EmailChangeDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PRIMARY_EMAIL_CHANGE_STARTED";
      "data"?: components["schemas"]["GenericAuthenticatedAckDTO"];
    } } };
    };
  };
  "AuthEmailsController_completePrimaryEmailChange_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["EmailTokenDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PRIMARY_EMAIL_CHANGED";
      "data"?: components["schemas"]["EmailChangeCompletedDTO"];
    } } };
    };
  };
  "AuthEmailsController_startBackupEmailChange_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["EmailChangeDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "BACKUP_EMAIL_CHANGE_STARTED";
      "data"?: components["schemas"]["GenericAuthenticatedAckDTO"];
    } } };
    };
  };
  "AuthEmailsController_completeBackupEmailChange_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["EmailTokenDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "BACKUP_EMAIL_CHANGED";
      "data"?: components["schemas"]["EmailChangeCompletedDTO"];
    } } };
    };
  };
  "AuthEmailsController_deleteBackupEmail_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "BACKUP_EMAIL_DELETED";
      "data"?: unknown | null;
    } } };
    };
  };
  "AccountRecoveryController_startAccountRecovery_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["AccountRecoveryStartDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ACCOUNT_RECOVERY_STARTED";
      "data"?: components["schemas"]["GenericPublicAckDTO"];
    } } };
    };
  };
  "AccountRecoveryController_completeAccountRecovery_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["AccountRecoveryCompleteDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ACCOUNT_RECOVERED";
      "data"?: components["schemas"]["AccountRecoveredDTO"];
    } } };
    };
  };
  "AuthMagicLinkController_startMagicLinkLogin_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["StartMagicLinkLoginDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "MAGIC_LINK_LOGIN_STARTED";
      "data"?: components["schemas"]["GenericPublicAckDTO"];
    } } };
    };
  };
  "AuthMagicLinkController_completeMagicLinkLogin_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["CompleteMagicLinkLoginDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "MAGIC_LINK_LOGIN_COMPLETED";
      "data"?: components["schemas"]["MagicLinkLoginDTO"];
    } } };
    };
  };
  "AuthMfaController_getMyMfaConfiguration_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "MFA_CONFIGURATION_RETRIEVED";
      "data"?: components["schemas"]["MfaConfigurationDTO"];
    } } };
    };
  };
  "AuthMfaController_enrollStart_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "TOTP_ENROLLMENT_STARTED";
      "data"?: components["schemas"]["MfaTotpEnrollStartDTO"];
    } } };
    };
  };
  "AuthMfaController_enrollComplete_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["MfaTotpEnrollCompleteDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "TOTP_ENROLLMENT_COMPLETED";
      "data"?: components["schemas"]["MfaTotpEnrollCompleteResponseDTO"];
    } } };
    };
  };
  "AuthMfaController_disableTotp_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["MfaDisableDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "TOTP_DISABLED";
      "data"?: unknown | null;
    } } };
    };
  };
  "AuthMfaController_verifyTotp_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["MfaTotpVerifyDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "TOTP_VERIFIED";
      "data"?: unknown | null;
    } } };
    };
  };
  "AuthMfaController_verifyRecoveryCode_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["MfaRecoveryCodeVerifyDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "RECOVERY_CODE_VERIFIED";
      "data"?: components["schemas"]["MfaRecoveryCodeSessionDTO"];
    } } };
    };
  };
  "AuthMfaController_regenerateRecoveryCodes_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "RECOVERY_CODES_REGENERATED";
      "data"?: components["schemas"]["MfaRecoveryCodesDTO"];
    } } };
    };
  };
  "AuthOAuthController_startOAuthLogin_v1": {
    parameters: { query?: never; header?: never; path?: { "provider": "github" | "google" }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "OAUTH_LOGIN_STARTED";
      "data"?: components["schemas"]["OAuthAuthorizationDTO"];
    } } };
    };
  };
  "AuthOAuthController_completeOAuthLogin_v1": {
    parameters: { query?: never; header?: never; path?: { "provider": "github" | "google" }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["CompleteOAuthLoginDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "OAUTH_LOGIN_COMPLETED";
      "data"?: components["schemas"]["OAuthLoginDTO"];
    } } };
    };
  };
  "AuthOAuthController_startOAuthLink_v1": {
    parameters: { query?: never; header?: never; path?: { "provider": "github" | "google" }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "OAUTH_LINK_STARTED";
      "data"?: components["schemas"]["OAuthAuthorizationDTO"];
    } } };
    };
  };
  "AuthOAuthController_completeOAuthLink_v1": {
    parameters: { query?: never; header?: never; path?: { "provider": "github" | "google" }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["CompleteOAuthLinkDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "OAUTH_LINKED";
      "data"?: components["schemas"]["OAuthCredentialLinkedDTO"];
    } } };
    };
  };
  "AuthenticationMethodsController_list_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "AUTHENTICATION_METHODS_RETRIEVED";
      "data"?: components["schemas"]["AuthenticationMethodDTO"][];
    } } };
    };
  };
  "AuthPasskeysController_listPasskeyDevices_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PASSKEY_DEVICES_LISTED";
      "data"?: components["schemas"]["PasskeyDeviceDTO"][];
    } } };
    };
  };
  "AuthPasskeysController_startPasskeyLogin_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PASSKEY_LOGIN_STARTED";
      "data"?: components["schemas"]["PasskeyChallengeDTO"];
    } } };
    };
  };
  "AuthPasskeysController_completePasskeyLogin_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["CompletePasskeyLoginDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PASSKEY_LOGIN_COMPLETED";
      "data"?: components["schemas"]["PasskeyLoginDTO"];
    } } };
    };
  };
  "AuthPasskeysController_startPasskeyRegistration_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PASSKEY_REGISTRATION_STARTED";
      "data"?: components["schemas"]["PasskeyChallengeDTO"];
    } } };
    };
  };
  "AuthPasskeysController_completePasskeyRegistration_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["CompletePasskeyRegistrationDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PASSKEY_REGISTERED";
      "data"?: components["schemas"]["PasskeyRegisteredDTO"];
    } } };
    };
  };
  "AuthPasskeysController_updatePasskeyDeviceName_v1": {
    parameters: { query?: never; header?: never; path?: { "credentialId": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["UpdatePasskeyDeviceNameDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PASSKEY_DEVICE_NAME_UPDATED";
      "data"?: unknown | null;
    } } };
    };
  };
  "AuthPasskeysController_deleteCredential_v1": {
    parameters: { query?: never; header?: never; path?: { "credentialId": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CREDENTIAL_DELETED";
      "data"?: unknown | null;
    } } };
    };
  };
  "AuthPossessionProofController_start_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "POSSESSION_PROOF_STARTED";
      "data"?: components["schemas"]["PossessionProofStartedDTO"];
    } } };
    };
  };
  "AuthPossessionProofController_complete_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["PossessionProofCompleteDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "POSSESSION_PROOF_COMPLETED";
      "data"?: components["schemas"]["PossessionProofRequirementResultDTO"];
    } } };
    };
  };
  "AuthPasswordController_startPasswordRegistration_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["PasswordRegisterStartDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PASSWORD_REGISTRATION_STARTED";
      "data"?: components["schemas"]["PasswordRegisterStartResponseDTO"];
    } } };
    };
  };
  "AuthPasswordController_completePasswordRegistration_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["PasswordRegisterFinishDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PASSWORD_REGISTRATION_COMPLETED";
      "data"?: components["schemas"]["PasswordRegistrationCompletedDTO"];
    } } };
    };
  };
  "AuthPasswordController_startPasswordLogin_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["PasswordLoginStartDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PASSWORD_LOGIN_STARTED";
      "data"?: components["schemas"]["PasswordLoginStartResponseDTO"];
    } } };
    };
  };
  "AuthPasswordController_completePasswordLogin_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["PasswordLoginFinishDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PASSWORD_LOGIN_COMPLETED";
      "data"?: components["schemas"]["PasswordLoginCompleteDTO"];
    } } };
    };
  };
  "AuthPasswordController_startPasswordRecovery_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["PasswordRecoverStartDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PASSWORD_RECOVERY_ACKNOWLEDGED";
      "data"?: components["schemas"]["GenericPublicAckDTO"];
    } } };
    };
  };
  "AuthPasswordController_completePasswordRecovery_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["PasswordRecoverCompleteDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PASSWORD_RECOVERY_COMPLETED";
      "data"?: components["schemas"]["PasswordRecoveryCompletedDTO"];
    } } };
    };
  };
  "AuthPasswordController_preparePasswordRecovery_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["PasswordRecoverPrepareDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PASSWORD_RECOVERY_PREPARED";
      "data"?: components["schemas"]["PasswordRecoverPrepareResponseDTO"];
    } } };
    };
  };
  "AuthPasswordController_startPasswordChange_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["PasswordChangeStartDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PASSWORD_CHANGE_STARTED";
      "data"?: components["schemas"]["PasswordChangeStartResponseDTO"];
    } } };
    };
  };
  "AuthPasswordController_completePasswordChange_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["PasswordChangeCompleteDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PASSWORD_CHANGED";
      "data"?: components["schemas"]["PasswordChangedDTO"];
    } } };
    };
  };
  "AuthPasswordController_startPasswordCredentialCreate_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["PasswordCredentialCreateStartDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PASSWORD_CREDENTIAL_CREATE_STARTED";
      "data"?: components["schemas"]["PasswordRegisterStartResponseDTO"];
    } } };
    };
  };
  "AuthPasswordController_completePasswordCredentialCreate_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["PasswordCredentialCreateCompleteDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PASSWORD_CREDENTIAL_CREATED";
      "data"?: components["schemas"]["PasswordCredentialCreatedDTO"];
    } } };
    };
  };
  "AuthSessionsController_listSessions_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "SESSIONS_LISTED";
      "data"?: components["schemas"]["SessionListDTO"];
    } } };
    };
  };
  "AuthSessionsController_revokeAllSessions_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "SESSIONS_REVOKED";
      "data"?: unknown | null;
    } } };
    };
  };
  "AuthSessionsController_getCurrentSession_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CURRENT_SESSION_RETRIEVED";
      "data"?: components["schemas"]["SessionDTO"];
    } } };
    };
  };
  "AuthSessionsController_revokeCurrentSession_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CURRENT_SESSION_REVOKED";
      "data"?: unknown | null;
    } } };
    };
  };
  "AuthSessionsController_revokeOtherSessions_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "OTHER_SESSIONS_REVOKED";
      "data"?: unknown | null;
    } } };
    };
  };
  "AuthSessionsController_revokeSession_v1": {
    parameters: { query?: never; header?: never; path?: { "sessionId": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "SESSION_REVOKED";
      "data"?: unknown | null;
    } } };
    };
  };
  "AccountController_reactivateFromToken_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["AccountReactivationDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ACCOUNT_REACTIVATED";
      "data"?: components["schemas"]["SessionOrMfaChallengeDTO"];
    } } };
    };
  };
  "AccountController_cancelDeletion_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["AccountDeletionRestoreAccessDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ACCOUNT_DELETION_CANCELLED";
      "data"?: components["schemas"]["GenericPublicAckDTO"];
    } } };
    };
  };
  "MediaController_request_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["RequestMediaUploadDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "UPLOAD_URL_GENERATED";
      "data"?: components["schemas"]["MediaUploadGrantDTO"];
    } } };
    };
  };
  "MediaController_confirm_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["ConfirmMediaUploadDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "UPLOAD_CONFIRMED";
      "data"?: components["schemas"]["ConfirmedMediaUploadDTO"];
    } } };
    };
  };
  "NotificationController_sync_v1": {
    parameters: { query?: { "cursor"?: string }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "NOTIFICATIONS_SYNCED";
      "data"?: components["schemas"]["SyncNotificationsDTO"];
    } } };
    };
  };
  "NotificationController_markRead_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "NOTIFICATION_MARKED_READ";
      "data"?: components["schemas"]["NotificationDTO"];
    } } };
    };
  };
  "NotificationController_markAllRead_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "NOTIFICATIONS_MARKED_READ";
      "data"?: components["schemas"]["MarkAllNotificationsReadResultDTO"];
    } } };
    };
  };
  "VoteController_set_v1": {
    parameters: { query?: never; header?: never; path?: { "resourceId": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_VOTE_SET";
      "data"?: components["schemas"]["VoteSetResultDTO"];
    } } };
    };
  };
  "VoteController_remove_v1": {
    parameters: { query?: never; header?: never; path?: { "resourceId": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_VOTE_SET";
      "data"?: components["schemas"]["VoteSetResultDTO"];
    } } };
    };
  };
  "VoteController_syncMine_v1": {
    parameters: { query?: { "updatedAfter"?: string }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_VOTE_SYNCED";
      "data"?: components["schemas"]["SyncMyVotesDTO"];
    } } };
    };
  };
  "BookmarkController_saveBookmark_v1": {
    parameters: { query?: never; header?: never; path?: { "resourceId": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "BOOKMARK_SAVED";
      "data"?: components["schemas"]["BookmarkDTO"];
    } } };
    };
  };
  "BookmarkController_removeBookmark_v1": {
    parameters: { query?: never; header?: never; path?: { "resourceId": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "BOOKMARK_REMOVED";
      "data"?: components["schemas"]["BookmarkDTO"];
    } } };
    };
  };
  "BookmarkController_syncBookmarks_v1": {
    parameters: { query?: { "updatedAfter"?: string }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "BOOKMARKS_SYNCED";
      "data"?: components["schemas"]["SyncMyBookmarksDTO"];
    } } };
    };
  };
  "BookmarkController_listBookmarks_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "BOOKMARKS_LISTED";
      "data"?: components["schemas"]["BookmarkDTO"][];
    } } };
    };
  };
  "ViewController_recordView_v1": {
    parameters: { query?: never; header?: never; path?: { "resourceId": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_VIEW_RECORDED";
      "data"?: components["schemas"]["ViewResultDTO"];
    } } };
    };
  };
  "CommentsController_listMine_v1": {
    parameters: { query?: { "hidden"?: boolean; "page"?: number; "pageSize"?: number }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_MY_COMMENTS_LISTED";
      "data"?: 
    {
      "items": components["schemas"]["CommentDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    } } };
    };
  };
  "CommentsController_listForAdministration_v1": {
    parameters: { query?: { "hidden"?: boolean; "page"?: number; "pageSize"?: number }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_ADMIN_COMMENTS_LISTED";
      "data"?: 
    {
      "items": components["schemas"]["CommentDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    } } };
    };
  };
  "CommentsController_updateComment_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["UpdateCommentDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_COMMENT_UPDATED";
      "data"?: unknown | null;
    } } };
    };
  };
  "CommentsController_deleteComment_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_COMMENT_DELETED";
      "data"?: unknown | null;
    } } };
    };
  };
  "DomainCommentsController_listArticleComments_v1": {
    parameters: { query?: never; header?: never; path?: { "articleId": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_COMMENTS_LISTED";
      "data"?: components["schemas"]["CommentDTO"][];
    } } };
    };
  };
  "DomainCommentsController_createArticleComment_v1": {
    parameters: { query?: never; header?: never; path?: { "articleId": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["CreateCommentDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_COMMENT_CREATED";
      "data"?: components["schemas"]["CommentCreatedDTO"];
    } } };
    };
  };
  "DomainCommentsController_listNewsComments_v1": {
    parameters: { query?: never; header?: never; path?: { "newsId": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_COMMENTS_LISTED";
      "data"?: components["schemas"]["CommentDTO"][];
    } } };
    };
  };
  "DomainCommentsController_createNewsComment_v1": {
    parameters: { query?: never; header?: never; path?: { "newsId": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["CreateCommentDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_COMMENT_CREATED";
      "data"?: components["schemas"]["CommentCreatedDTO"];
    } } };
    };
  };
  "ModerationController_hideResourceById_v1": {
    parameters: { query?: never; header?: never; path?: { "resourceId": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: unknown | null;
    } } };
    };
  };
  "ModerationController_unhideResourceById_v1": {
    parameters: { query?: never; header?: never; path?: { "resourceId": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: unknown | null;
    } } };
    };
  };
  "ModerationController_hideCommentById_v1": {
    parameters: { query?: never; header?: never; path?: { "commentId": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: unknown | null;
    } } };
    };
  };
  "ModerationController_unhideCommentById_v1": {
    parameters: { query?: never; header?: never; path?: { "commentId": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: unknown | null;
    } } };
    };
  };
  "ModerationController_listHidden_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_LISTED";
      "data"?: unknown | null;
    } } };
    };
  };
  "AccountRestrictionsController_getStanding_v1": {
    parameters: { query?: never; header?: never; path?: { "accountId": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ACCOUNT_STANDING_RETRIEVED";
      "data"?: components["schemas"]["GetAccountStandingOutputDTO"];
    } } };
    };
  };
  "AccountRestrictionsController_restrict_v1": {
    parameters: { query?: never; header?: never; path?: { "accountId": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["RestrictAccountCapabilityInputDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ACCOUNT_CAPABILITY_RESTRICTED";
      "data"?: components["schemas"]["RestrictAccountCapabilityOutputDTO"];
    } } };
    };
  };
  "AccountRestrictionsController_revoke_v1": {
    parameters: { query?: never; header?: never; path?: { "accountId": string; "restrictionId": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["RevokeAccountRestrictionInputDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ACCOUNT_RESTRICTION_REVOKED";
      "data"?: components["schemas"]["RevokeAccountRestrictionOutputDTO"];
    } } };
    };
  };
  "ArticlesController_list_v1": {
    parameters: { query?: { "search"?: string; "tags"?: string; "page"?: number; "pageSize"?: number; "sort"?: "votes" | "views" | "comments"; "period"?: "day" | "week" | "month" | "year" | "all" }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ARTICLE_LISTED";
      "data"?: 
    {
      "items": components["schemas"]["ArticleItemDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    } } };
    };
  };
  "ArticlesController_listPopularTags_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ARTICLE_LISTED";
      "data"?: components["schemas"]["ArticlePopularTagDTO"][];
    } } };
    };
  };
  "ArticlesController_rss_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: Record<string, never> };
    };
  };
  "ArticlesController_listOwn_v1": {
    parameters: { query?: { "search"?: string; "tags"?: string; "page"?: number; "pageSize"?: number; "sort"?: "votes" | "views" | "comments"; "period"?: "day" | "week" | "month" | "year" | "all" }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ARTICLE_LISTED";
      "data"?: 
    {
      "items": components["schemas"]["ArticleItemDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    } } };
    };
  };
  "ArticlesController_listForModeration_v1": {
    parameters: { query?: { "search"?: string; "tags"?: string; "page"?: number; "pageSize"?: number; "sort"?: "votes" | "views" | "comments"; "period"?: "day" | "week" | "month" | "year" | "all" }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ARTICLE_LISTED";
      "data"?: 
    {
      "items": components["schemas"]["ArticleItemDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    } } };
    };
  };
  "ArticlesController_getById_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ARTICLE_FETCHED";
      "data"?: components["schemas"]["ArticleDTO"];
    } } };
    };
  };
  "ArticlesController_getContentById_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ARTICLE_FETCHED";
      "data"?: components["schemas"]["ArticleContentDTO"];
    } } };
    };
  };
  "ArticlesController_getBySlug_v1": {
    parameters: { query?: never; header?: never; path?: { "slug": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ARTICLE_FETCHED";
      "data"?: components["schemas"]["ArticleDTO"];
    } } };
    };
  };
  "ArticlesController_getContentBySlug_v1": {
    parameters: { query?: never; header?: never; path?: { "slug": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ARTICLE_FETCHED";
      "data"?: components["schemas"]["ArticleContentDTO"];
    } } };
    };
  };
  "ArticlesController_saveDraft_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["SaveArticleDraftInputDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ARTICLE_DRAFT_SAVED";
      "data"?: components["schemas"]["SaveArticleDraftOutputDTO"];
    } } };
    };
  };
  "ArticlesController_publish_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["ArticlePublishInputDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ARTICLE_PUBLISHED";
      "data"?: unknown | null;
    } } };
    };
  };
  "ArticlesController_archive_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ARTICLE_ARCHIVED";
      "data"?: unknown | null;
    } } };
    };
  };
  "ArticlesController_unarchive_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ARTICLE_UNARCHIVED";
      "data"?: unknown | null;
    } } };
    };
  };
  "ArticlesController_setCommentsEnabled_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["SetArticleCommentsEnabledDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ARTICLE_COMMENTS_SETTINGS_UPDATED";
      "data"?: unknown | null;
    } } };
    };
  };
  "ArticlesController_update_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["UpdateArticleDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ARTICLE_UPDATED";
      "data"?: unknown | null;
    } } };
    };
  };
  "ArticlesController_delete_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "ARTICLE_DELETED";
      "data"?: unknown | null;
    } } };
    };
  };
  "NewsController_list_v1": {
    parameters: { query?: { "search"?: string; "tags"?: string; "source"?: string; "page"?: number; "pageSize"?: number; "sort"?: "recent" | "oldest" | "views"; "period"?: "day" | "week" | "month" | "year" | "all" }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "NEWS_LISTED";
      "data"?: 
    {
      "items": components["schemas"]["NewsItemDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    } } };
    };
  };
  "NewsController_rss_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: Record<string, never> };
    };
  };
  "NewsController_listPopularSources_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "NEWS_SOURCES_LISTED";
      "data"?: components["schemas"]["NewsSourceDTO"];
    } } };
    };
  };
  "NewsController_submitSuggestion_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["SubmitNewsSuggestionDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "NEWS_SUGGESTION_SUBMITTED";
      "data"?: components["schemas"]["NewsSuggestionDTO"];
    } } };
    };
  };
  "NewsController_listPendingSuggestions_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "NEWS_SUGGESTIONS_LISTED";
      "data"?: components["schemas"]["NewsSuggestionDTO"];
    } } };
    };
  };
  "NewsController_listMySuggestions_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "NEWS_SUGGESTIONS_LISTED";
      "data"?: components["schemas"]["NewsSuggestionDTO"];
    } } };
    };
  };
  "NewsController_acceptSuggestion_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["AcceptNewsSuggestionDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "NEWS_SUGGESTION_ACCEPTED";
      "data"?: unknown | null;
    } } };
    };
  };
  "NewsController_rejectSuggestion_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "NEWS_SUGGESTION_REJECTED";
      "data"?: unknown | null;
    } } };
    };
  };
  "NewsController_listForManagement_v1": {
    parameters: { query?: { "search"?: string; "tags"?: string; "source"?: string; "page"?: number; "pageSize"?: number; "sort"?: "recent" | "oldest" | "views"; "period"?: "day" | "week" | "month" | "year" | "all" }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "NEWS_LISTED";
      "data"?: 
    {
      "items": components["schemas"]["NewsItemDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    } } };
    };
  };
  "NewsController_getById_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "NEWS_RETRIEVED";
      "data"?: components["schemas"]["NewsDTO"];
    } } };
    };
  };
  "NewsController_getBySlug_v1": {
    parameters: { query?: never; header?: never; path?: { "slug": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "NEWS_RETRIEVED";
      "data"?: components["schemas"]["NewsDTO"];
    } } };
    };
  };
  "NewsController_saveDraft_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["SaveNewsDraftInputDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "NEWS_DRAFT_SAVED";
      "data"?: components["schemas"]["SaveNewsDraftOutputDTO"];
    } } };
    };
  };
  "NewsController_publish_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "NEWS_PUBLISHED";
      "data"?: unknown | null;
    } } };
    };
  };
  "NewsController_archive_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "NEWS_ARCHIVED";
      "data"?: unknown | null;
    } } };
    };
  };
  "NewsController_unarchive_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "NEWS_UNARCHIVED";
      "data"?: unknown | null;
    } } };
    };
  };
  "NewsController_setCommentsEnabled_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["SetNewsCommentsEnabledDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "NEWS_COMMENTS_SETTINGS_UPDATED";
      "data"?: unknown | null;
    } } };
    };
  };
  "NewsController_update_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["UpdateNewsDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "NEWS_UPDATED";
      "data"?: unknown | null;
    } } };
    };
  };
  "NewsController_delete_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "NEWS_DELETED";
      "data"?: unknown | null;
    } } };
    };
  };
  "ResourcesController_list_v1": {
    parameters: { query?: { "search"?: string; "tags"?: string; "page": number; "pageSize": number; "sort"?: "votes" }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "RESOURCES_LISTED";
      "data"?: 
    {
      "items": components["schemas"]["ResourceItemDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    } } };
    };
  };
  "ResourcesController_create_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["CreateResourceDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "RESOURCE_CREATED";
      "data"?: components["schemas"]["ResourceItemDTO"];
    } } };
    };
  };
  "ResourcesController_listPendingSuggestions_v1": {
    parameters: { query?: { "search"?: string; "tags"?: string; "page": number; "pageSize": number; "sort"?: "votes" }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PENDING_EXTERNAL_RESOURCE_SUGGESTIONS_LISTED";
      "data"?: 
    {
      "items": components["schemas"]["ExternalResourceSuggestionDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    } } };
    };
  };
  "ResourcesController_listMySuggestions_v1": {
    parameters: { query?: { "search"?: string; "tags"?: string; "page": number; "pageSize": number; "sort"?: "votes" }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "EXTERNAL_RESOURCE_SUGGESTIONS_LISTED";
      "data"?: 
    {
      "items": components["schemas"]["ExternalResourceSuggestionDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    } } };
    };
  };
  "ResourcesController_listForManagement_v1": {
    parameters: { query?: { "search"?: string; "tags"?: string; "page": number; "pageSize": number; "sort"?: "votes" }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "RESOURCES_LISTED";
      "data"?: 
    {
      "items": components["schemas"]["ResourceItemDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    } } };
    };
  };
  "ResourcesController_getForManagement_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "RESOURCE_RETRIEVED";
      "data"?: components["schemas"]["ResourceItemDTO"];
    } } };
    };
  };
  "ResourcesController_getById_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "RESOURCE_RETRIEVED";
      "data"?: components["schemas"]["ResourceItemDTO"];
    } } };
    };
  };
  "ResourcesController_update_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["UpdateResourceDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "RESOURCE_UPDATED";
      "data"?: unknown | null;
    } } };
    };
  };
  "ResourcesController_delete_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "RESOURCE_DELETED";
      "data"?: unknown | null;
    } } };
    };
  };
  "ResourcesController_suggest_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["SuggestExternalResourceDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "EXTERNAL_RESOURCE_SUGGESTION_CREATED";
      "data"?: components["schemas"]["ExternalResourceSuggestionDTO"];
    } } };
    };
  };
  "ResourcesController_approveSuggestion_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["ApproveExternalResourceSuggestionDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "EXTERNAL_RESOURCE_SUGGESTION_APPROVED";
      "data"?: unknown | null;
    } } };
    };
  };
  "ResourcesController_rejectSuggestion_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["RejectResourceDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "EXTERNAL_RESOURCE_SUGGESTION_REJECTED";
      "data"?: unknown | null;
    } } };
    };
  };
  "ResourcesController_archive_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "RESOURCE_ARCHIVED";
      "data"?: unknown | null;
    } } };
    };
  };
  "ResourcesController_unarchive_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "RESOURCE_UNARCHIVED";
      "data"?: unknown | null;
    } } };
    };
  };
  "TaxonomyTagsController_aliases_v1": {
    parameters: { query?: { "tagId"?: string }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "TAG_ALIASES_LISTED";
      "data"?: components["schemas"]["TagAliasDTO"][];
    } } };
    };
  };
  "TaxonomyTagsController_createAlias_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["CreateTagAliasDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "TAG_ALIAS_CREATED";
      "data"?: components["schemas"]["TagAliasDTO"];
    } } };
    };
  };
  "TaxonomyTagsController_deleteAlias_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "TAG_ALIAS_DELETED";
      "data"?: unknown | null;
    } } };
    };
  };
  "TaxonomyTagsController_identityTerms_v1": {
    parameters: { query?: { "kind"?: "reserved" | "blocked" }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "TAG_IDENTITY_TERMS_LISTED";
      "data"?: components["schemas"]["TagIdentityTermDTO"][];
    } } };
    };
  };
  "TaxonomyTagsController_setIdentityTerm_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["SetTagIdentityTermDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "TAG_IDENTITY_TERM_SET";
      "data"?: components["schemas"]["TagIdentityTermDTO"];
    } } };
    };
  };
  "TaxonomyTagsController_deleteIdentityTerm_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "TAG_IDENTITY_TERM_DELETED";
      "data"?: unknown | null;
    } } };
    };
  };
  "TaxonomyTagsController_list_v1": {
    parameters: { query?: { "search"?: string; "slug"?: string; "page"?: number; "pageSize"?: number }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "TAGS_SEARCHED";
      "data"?: components["schemas"]["TagDTO"][];
    } } };
    };
  };
  "TaxonomyTagsController_create_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["CreateTagDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "TAG_CREATED";
      "data"?: components["schemas"]["TagDTO"];
    } } };
    };
  };
  "TaxonomyTagsController_page_v1": {
    parameters: { query?: { "search"?: string; "slug"?: string; "page"?: number; "pageSize"?: number }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "TAGS_SEARCHED";
      "data"?: 
    {
      "items": components["schemas"]["TagDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    } } };
    };
  };
  "TaxonomyTagsController_resolve_v1": {
    parameters: { query?: { "value": string }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "TAG_RESOLVED";
      "data"?: components["schemas"]["TagDTO"];
    } } };
    };
  };
  "TaxonomyTagsController_archive_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "TAG_ARCHIVED";
      "data"?: unknown | null;
    } } };
    };
  };
  "TaxonomyTagsController_unarchive_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "TAG_UNARCHIVED";
      "data"?: unknown | null;
    } } };
    };
  };
  "TaxonomyTagsController_update_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["UpdateTagDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "TAG_UPDATED";
      "data"?: unknown | null;
    } } };
    };
  };
  "TaxonomyTagsController_delete_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "TAG_DELETED";
      "data"?: unknown | null;
    } } };
    };
  };
  "TaxonomyTagsController_merge_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["MergeTagsDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "TAG_MERGED";
      "data"?: unknown | null;
    } } };
    };
  };
  "DiscoveryController_search_v1": {
    parameters: { query?: { "search"?: string; "types"?: string; "tags"?: string; "page"?: number; "pageSize"?: number }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "DISCOVERY_LISTED";
      "data"?: components["schemas"]["SearchExploreOutputDTO"];
    } } };
    };
  };
  "DiscoveryController_feed_v1": {
    parameters: { query?: { "search"?: string; "types"?: string; "tags"?: string; "page"?: number; "pageSize"?: number }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "DISCOVERY_LISTED";
      "data"?: components["schemas"]["GetFeedOutputDTO"];
    } } };
    };
  };
  "DiscoveryController_trending_v1": {
    parameters: { query?: { "search"?: string; "types"?: string; "tags"?: string; "page"?: number; "pageSize"?: number }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "DISCOVERY_LISTED";
      "data"?: components["schemas"]["ListTrendingContentOutputDTO"];
    } } };
    };
  };
  "DiscoveryController_popular_v1": {
    parameters: { query?: { "search"?: string; "types"?: string; "tags"?: string; "page"?: number; "pageSize"?: number }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "DISCOVERY_LISTED";
      "data"?: components["schemas"]["ListPopularContentOutputDTO"];
    } } };
    };
  };
  "DiscoveryController_recent_v1": {
    parameters: { query?: { "search"?: string; "types"?: string; "tags"?: string; "page"?: number; "pageSize"?: number }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "DISCOVERY_LISTED";
      "data"?: components["schemas"]["ListRecentContentOutputDTO"];
    } } };
    };
  };
  "DiscoveryController_related_v1": {
    parameters: { query?: { "limit"?: number }; header?: never; path?: { "resourceId": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "DISCOVERY_LISTED";
      "data"?: components["schemas"]["GetRelatedContentOutputDTO"];
    } } };
    };
  };
  "QAndAController_list_v1": {
    parameters: { query?: { "search"?: string; "status"?: "open" | "closed" | "solved"; "tags"?: string; "sort"?: "recent" | "answers"; "page"?: number; "pageSize"?: number }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_LISTED";
      "data"?: components["schemas"]["PaginatedQuestionsDTO"];
    } } };
    };
  };
  "QAndAController_create_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["CreateQuestionDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_CREATED";
      "data"?: components["schemas"]["QuestionDTO"];
    } } };
    };
  };
  "QAndAController_listMine_v1": {
    parameters: { query?: { "limit": string }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_LISTED";
      "data"?: components["schemas"]["QAndAAccountContributionDTO"][];
    } } };
    };
  };
  "QAndAController_listForAdministration_v1": {
    parameters: { query?: { "search"?: string; "status"?: "open" | "closed" | "solved"; "tags"?: string; "sort"?: "recent" | "answers"; "page"?: number; "pageSize"?: number }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_LISTED";
      "data"?: components["schemas"]["PaginatedQuestionsDTO"];
    } } };
    };
  };
  "QAndAController_get_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_FETCHED";
      "data"?: components["schemas"]["QuestionDTO"];
    } } };
    };
  };
  "QAndAController_delete_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_DELETED";
      "data"?: unknown | null;
    } } };
    };
  };
  "QAndAController_answer_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["CreateAnswerDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_CREATED";
      "data"?: components["schemas"]["AnswerDTO"];
    } } };
    };
  };
  "QAndAController_accept_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string; "answerId": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: components["schemas"]["QuestionDTO"];
    } } };
    };
  };
  "QAndAController_removeAccepted_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: components["schemas"]["QuestionDTO"];
    } } };
    };
  };
  "QAndAController_deleteAnswer_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string; "answerId": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_DELETED";
      "data"?: unknown | null;
    } } };
    };
  };
  "QAndAController_close_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: components["schemas"]["QuestionDTO"];
    } } };
    };
  };
  "QAndAController_reopen_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: components["schemas"]["QuestionDTO"];
    } } };
    };
  };
  "AnswersController_listMine_v1": {
    parameters: { query?: { "limit": string }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_LISTED";
      "data"?: components["schemas"]["QAndAAccountContributionDTO"][];
    } } };
    };
  };
  "JobController_listManagement_v1": {
    parameters: { query?: { "search"?: string; "publisherOrganizationId"?: string; "employmentType"?: "full_time" | "part_time" | "contract" | "internship" | "temporary"; "workplaceType"?: "remote" | "hybrid" | "onsite"; "location"?: string; "minComp"?: number; "tags"?: string; "sort"?: "recent" | "comp"; "page"?: number; "pageSize"?: number }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_LISTED";
      "data"?: components["schemas"]["PaginatedJobsDTO"];
    } } };
    };
  };
  "JobController_list_v1": {
    parameters: { query?: { "search"?: string; "publisherOrganizationId"?: string; "employmentType"?: "full_time" | "part_time" | "contract" | "internship" | "temporary"; "workplaceType"?: "remote" | "hybrid" | "onsite"; "location"?: string; "minComp"?: number; "tags"?: string; "sort"?: "recent" | "comp"; "page"?: number; "pageSize"?: number }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_LISTED";
      "data"?: components["schemas"]["PaginatedJobsDTO"];
    } } };
    };
  };
  "JobController_create_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["SaveJobDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_CREATED";
      "data"?: components["schemas"]["JobDTO"];
    } } };
    };
  };
  "JobController_mine_v1": {
    parameters: { query?: { "search"?: string; "publisherOrganizationId"?: string; "employmentType"?: "full_time" | "part_time" | "contract" | "internship" | "temporary"; "workplaceType"?: "remote" | "hybrid" | "onsite"; "location"?: string; "minComp"?: number; "tags"?: string; "sort"?: "recent" | "comp"; "page"?: number; "pageSize"?: number }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_LISTED";
      "data"?: components["schemas"]["PaginatedJobsDTO"];
    } } };
    };
  };
  "JobController_get_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_FETCHED";
      "data"?: components["schemas"]["JobDTO"];
    } } };
    };
  };
  "JobController_update_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["UpdateJobDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: components["schemas"]["JobDTO"];
    } } };
    };
  };
  "JobController_delete_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_DELETED";
      "data"?: unknown | null;
    } } };
    };
  };
  "JobController_submit_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["SubmitCommunityJobDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_CREATED";
      "data"?: unknown | null;
    } } };
    };
  };
  "JobController_mySuggestions_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_LISTED";
      "data"?: unknown | null;
    } } };
    };
  };
  "JobController_pendingSuggestions_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_LISTED";
      "data"?: unknown | null;
    } } };
    };
  };
  "JobController_acceptSuggestion_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: unknown | null;
    } } };
    };
  };
  "JobController_rejectSuggestion_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: unknown | null;
    } } };
    };
  };
  "JobController_close_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: components["schemas"]["JobDTO"];
    } } };
    };
  };
  "JobController_withdraw_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: components["schemas"]["JobDTO"];
    } } };
    };
  };
  "JobController_renew_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: components["schemas"]["JobDTO"];
    } } };
    };
  };
  "ProjectController_listManagement_v1": {
    parameters: { query?: { "search"?: string; "authorAccountId"?: string; "tags"?: string; "sort"?: "recent" | "title"; "page"?: number; "pageSize"?: number }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_LISTED";
      "data"?: components["schemas"]["PaginatedProjectsDTO"];
    } } };
    };
  };
  "ProjectController_list_v1": {
    parameters: { query?: { "search"?: string; "authorAccountId"?: string; "tags"?: string; "sort"?: "recent" | "title"; "page"?: number; "pageSize"?: number }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_LISTED";
      "data"?: components["schemas"]["PaginatedProjectsDTO"];
    } } };
    };
  };
  "ProjectController_create_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["SaveProjectDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_CREATED";
      "data"?: components["schemas"]["ProjectDTO"];
    } } };
    };
  };
  "ProjectController_mine_v1": {
    parameters: { query?: { "search"?: string; "authorAccountId"?: string; "tags"?: string; "sort"?: "recent" | "title"; "page"?: number; "pageSize"?: number }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_LISTED";
      "data"?: components["schemas"]["PaginatedProjectsDTO"];
    } } };
    };
  };
  "ProjectController_get_v1": {
    parameters: { query?: never; header?: never; path?: { "slug": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_FETCHED";
      "data"?: components["schemas"]["ProjectDTO"];
    } } };
    };
  };
  "ProjectController_getById_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_FETCHED";
      "data"?: components["schemas"]["ProjectDTO"];
    } } };
    };
  };
  "ProjectController_update_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["UpdateProjectDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: components["schemas"]["ProjectDTO"];
    } } };
    };
  };
  "ProjectController_remove_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_DELETED";
      "data"?: unknown | null;
    } } };
    };
  };
  "ProjectController_publish_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: components["schemas"]["ProjectDTO"];
    } } };
    };
  };
  "ProjectController_archive_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: components["schemas"]["ProjectDTO"];
    } } };
    };
  };
  "ProjectController_unarchive_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: components["schemas"]["ProjectDTO"];
    } } };
    };
  };
  "EventController_list_v1": {
    parameters: { query?: { "page"?: number; "pageSize"?: number; "search"?: string; "temporalState"?: "upcoming" | "ongoing" | "ended"; "format"?: "online" | "in_person" | "hybrid"; "sort"?: "upcoming" | "recent" }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_LISTED";
      "data"?: components["schemas"]["PaginatedEventsDTO"];
    } } };
    };
  };
  "EventController_create_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["CreateEventDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_CREATED";
      "data"?: components["schemas"]["EventDTO"];
    } } };
    };
  };
  "EventController_listManagement_v1": {
    parameters: { query?: { "page"?: number; "pageSize"?: number; "search"?: string; "temporalState"?: "upcoming" | "ongoing" | "ended"; "format"?: "online" | "in_person" | "hybrid"; "sort"?: "upcoming" | "recent" }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_LISTED";
      "data"?: components["schemas"]["PaginatedEventsDTO"];
    } } };
    };
  };
  "EventController_submit_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["SubmitEventSuggestionDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: Record<string, never> };
    };
  };
  "EventController_mySuggestions_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: Record<string, never> };
    };
  };
  "EventController_pendingSuggestions_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: Record<string, never> };
    };
  };
  "EventController_accept_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["AcceptEventSuggestionDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: Record<string, never> };
    };
  };
  "EventController_reject_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["RejectEventDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: Record<string, never> };
    };
  };
  "EventController_getManagement_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_FETCHED";
      "data"?: components["schemas"]["EventDTO"];
    } } };
    };
  };
  "EventController_get_v1": {
    parameters: { query?: never; header?: never; path?: { "slug": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_FETCHED";
      "data"?: components["schemas"]["EventDTO"];
    } } };
    };
  };
  "EventController_update_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["UpdateEventDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: components["schemas"]["EventDTO"];
    } } };
    };
  };
  "EventController_delete_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_DELETED";
      "data"?: unknown | null;
    } } };
    };
  };
  "EventController_review_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["ReviewEventDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: components["schemas"]["EventDTO"];
    } } };
    };
  };
  "OrganizationController_list_v1": {
    parameters: { query?: { "search"?: string; "page"?: number; "pageSize"?: number }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_LISTED";
      "data"?: components["schemas"]["PaginatedOrganizationsDTO"];
    } } };
    };
  };
  "OrganizationController_create_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["CreateOrganizationDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_CREATED";
      "data"?: components["schemas"]["OrganizationDTO"];
    } } };
    };
  };
  "OrganizationController_mine_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_LISTED";
      "data"?: components["schemas"]["MyOrganizationDTO"][];
    } } };
    };
  };
  "OrganizationController_get_v1": {
    parameters: { query?: never; header?: never; path?: { "slug": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_FETCHED";
      "data"?: components["schemas"]["OrganizationDTO"];
    } } };
    };
  };
  "OrganizationController_update_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["UpdateOrganizationDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: components["schemas"]["OrganizationDTO"];
    } } };
    };
  };
  "OrganizationController_delete_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_DELETED";
      "data"?: unknown | null;
    } } };
    };
  };
  "OrganizationController_archive_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: components["schemas"]["OrganizationDTO"];
    } } };
    };
  };
  "OrganizationController_unarchive_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: components["schemas"]["OrganizationDTO"];
    } } };
    };
  };
  "OrganizationController_members_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_LISTED";
      "data"?: components["schemas"]["OrganizationMembershipDTO"][];
    } } };
    };
  };
  "OrganizationController_addMember_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["AddOrganizationMemberDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_CREATED";
      "data"?: components["schemas"]["OrganizationMembershipDTO"];
    } } };
    };
  };
  "OrganizationController_changeRole_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string; "accountId": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["ChangeOrganizationMemberRoleDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_UPDATED";
      "data"?: components["schemas"]["OrganizationMembershipDTO"];
    } } };
    };
  };
  "OrganizationController_removeMember_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string; "accountId": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_DELETED";
      "data"?: unknown | null;
    } } };
    };
  };
  "OrganizationController_leave_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTENT_DELETED";
      "data"?: unknown | null;
    } } };
    };
  };
  "TagFollowController_list_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: Record<string, never> };
    };
  };
  "TagFollowController_follow_v1": {
    parameters: { query?: never; header?: never; path?: { "slug": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "201": { headers: { [name: string]: unknown }; content: Record<string, never> };
    };
  };
  "TagFollowController_unfollow_v1": {
    parameters: { query?: never; header?: never; path?: { "slug": string }; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: Record<string, never> };
    };
  };
  "ReportController_reportResource_v1": {
    parameters: { query?: never; header?: never; path?: { "resourceId": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["CreateResourceReportDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: Record<string, never> };
    };
  };
  "ReportController_reportComment_v1": {
    parameters: { query?: never; header?: never; path?: { "commentId": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["CreateCommentReportDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: Record<string, never> };
    };
  };
  "ReportController_listResourceReports_v1": {
    parameters: { query?: { "status"?: "pending" | "resolved" | "dismissed" }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: Record<string, never> };
    };
  };
  "ReportController_listCommentReports_v1": {
    parameters: { query?: { "status"?: "pending" | "resolved" | "dismissed" }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: Record<string, never> };
    };
  };
  "ReportController_reviewResourceReport_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["ReviewReportDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: Record<string, never> };
    };
  };
  "ReportController_reviewCommentReport_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["ReviewReportDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: Record<string, never> };
    };
  };
  "PlatformController_getHealth_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PLATFORM_HEALTH_RETRIEVED";
      "data"?: components["schemas"]["HealthStatusDTO"];
    } } };
    };
  };
  "PlatformController_getReadiness_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "PLATFORM_READINESS_RETRIEVED";
      "data"?: components["schemas"]["ReadinessStatusDTO"];
    } } };
    };
  };
  "ContactController_submit_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["SubmitContactMessageInputDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "CONTACT_MESSAGE_SUBMITTED";
      "data"?: components["schemas"]["SubmitContactMessageOutputDTO"];
    } } };
    };
  };
  "FeedbackController_submit_v1": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["SubmitFeedbackDTO"] } };
    responses: {
      "201": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "FEEDBACK_SUBMITTED";
      "data"?: unknown | null;
    } } };
    };
  };
  "FeedbackController_listForAdministration_v1": {
    parameters: { query?: { "status"?: "open" | "in_review" | "resolved" | "dismissed"; "page"?: number; "pageSize"?: number }; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "FEEDBACK_ADMINISTRATION_LISTED";
      "data"?: 
    {
      "items": components["schemas"]["FeedbackDTO"][];
      "page": number;
      "pageSize": number;
      "total": number;
    };
    } } };
    };
  };
  "FeedbackController_updateStatus_v1": {
    parameters: { query?: never; header?: never; path?: { "id": string }; cookie?: never };
    requestBody: { content: { "application/json": components["schemas"]["UpdateFeedbackStatusDTO"] } };
    responses: {
      "200": { headers: { [name: string]: unknown }; content: { "application/json": components["schemas"]["ApiResponseDTO"] & 
    {
      "code"?: "FEEDBACK_STATUS_UPDATED";
      "data"?: components["schemas"]["FeedbackDTO"];
    } } };
    };
  };
}
