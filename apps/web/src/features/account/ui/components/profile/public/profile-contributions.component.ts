import { BriefcaseBusiness, FileText, FolderKanban, Globe, MessageSquareText, Send } from 'lucide-solid';
import type { PublicProfileDTO } from '@/features/account/types/profile.type.ts';
import { routes } from '@/shared/navigation/routes';
import type { TranslationKey } from '@/features/account/i18n';

export type ProfileContribution = PublicProfileDTO['contributions'][number];
export type ProfileContributionType = ProfileContribution['type'];
export type ProfileTab = 'articles' | 'projects' | 'qa' | 'resources' | 'jobs';

export const contributionMeta: Record<ProfileContributionType, { labelKey: TranslationKey; icon: typeof FileText }> = {
  article: { labelKey: 'profile.type.article', icon: FileText },
  project: { labelKey: 'profile.type.project', icon: FolderKanban },
  question: { labelKey: 'profile.type.question', icon: MessageSquareText },
  answer: { labelKey: 'profile.type.answer', icon: Send },
  resource: { labelKey: 'profile.type.resource', icon: Globe },
  job: { labelKey: 'profile.type.job', icon: BriefcaseBusiness },
};

export const profileTabs: Array<{ id: ProfileTab; labelKey: TranslationKey; types: ProfileContributionType[] }> = [
  { id: 'articles', labelKey: 'profile.type.article', types: ['article'] },
  { id: 'projects', labelKey: 'profile.type.project', types: ['project'] },
  { id: 'qa', labelKey: 'profile.tab.qa', types: ['question', 'answer'] },
  { id: 'resources', labelKey: 'profile.type.resource', types: ['resource'] },
  { id: 'jobs', labelKey: 'profile.type.job', types: ['job'] },
];

export function contributionHref(item: ProfileContribution) {
  switch (item.type) {
    case 'article':
      return item.slug ? routes.article(item.slug) : routes.articles;
    case 'project':
      return item.slug ? routes.project(item.slug) : routes.projects;
    case 'question':
      return routes.question(item.id);
    case 'answer':
      return item.parentId ? routes.question(item.parentId) : routes.questions;
    case 'resource':
      return `/resources#${encodeURIComponent(item.id)}`;
    case 'job':
      return routes.job(item.id);
    default:
      return routes.account.root;
  }
}
