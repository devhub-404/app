export { useAccount } from '../ui/hooks/use-account.hook.ts';
export { default as AccountDeletionCancelPage } from '../ui/pages/lifecycle/account-deletion-cancel.page.astro';
export { default as AccountReactivationPage } from '../ui/pages/lifecycle/account-reactivation.page.astro';
export { default as AccountPage } from '../ui/pages/account/account.page.astro';
export { default as AccountPreferencesPage } from '../ui/pages/account/account-preferences.page.astro';
export { default as AccountCommentsPage } from '../ui/pages/account/account-comments.page.astro';
export { default as AccountVotesPageRoute } from '../ui/pages/interactions/votes.page.astro';
export { default as AccountViewsPageRoute } from '../ui/pages/interactions/views.page.astro';
export { default as AccountNotificationsPageRoute } from '../ui/pages/interactions/notifications.page.astro';
export { default as BookmarksPage } from '../ui/pages/bookmarks/bookmarks.page.astro';
export { default as MyArticlesPage } from '../ui/pages/articles/my-articles.page.astro';
export { default as AccountQuestionsPage } from '../ui/pages/content/questions.page.astro';
export { default as AccountAnswersPage } from '../ui/pages/content/answers.page.astro';
export { default as AccountResourceSuggestionsPage } from '../ui/pages/contributions/resources.page.astro';
export { default as AccountNewsSuggestionsPage } from '../ui/pages/contributions/news.page.astro';
export { default as AccountEventSuggestionsPage } from '../ui/pages/contributions/events.page.astro';
export { default as AccountJobSuggestionsPage } from '../ui/pages/contributions/jobs.page.astro';
export { default as ProfileSettingsPage } from '../ui/pages/settings/profile-settings.page.astro';
export { default as SessionsSettingsPage } from '../ui/pages/settings/sessions-settings.page.astro';
export { default as SettingsSectionPage } from '../ui/pages/settings/settings-section.page.astro';
export { default as PublicProfilePage } from '../ui/pages/profile/public-profile.page.astro';
export { default as PublicProfileArticlesPage } from '../ui/pages/profile/public-profile-articles.page.astro';
export { reactivateAccount } from '../actions/account-lifecycle.action.ts';

export { getProfileByUsername } from '../actions/profile.action.ts';
export type { PublicProfileDTO } from '../types/profile.type.ts';

export { default as UserMenu } from '../ui/components/user-menu.component.tsx';
