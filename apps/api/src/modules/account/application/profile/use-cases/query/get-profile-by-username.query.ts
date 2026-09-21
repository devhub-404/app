import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { ArticlePublicServicePort } from '@/modules/article/public';
import { QAndAPublicServicePort } from '@/modules/q-and-a/public';
import { ExternalResourcePublicServicePort } from '@/modules/external-resource/public';
import { ProjectPublicServicePort } from '@/modules/project/public';
import { OrganizationPublicServicePort } from '@/modules/organization/public';
import { ProfileQueryRepository } from '@/modules/account/application/profile/ports/profile.query.repository';
import type { PublicProfileContributionDTO, PublicProfileDTO } from '@/modules/account/application/profile/dtos/out';
const CONTRIBUTION_LIMIT_PER_OWNER = 20;
@Injectable()
export class GetProfileByUsernameQuery {
  constructor(
    private readonly profileQueryRepository: ProfileQueryRepository,
    private readonly articles: ArticlePublicServicePort,
    private readonly projects: ProjectPublicServicePort,
    private readonly qAndA: QAndAPublicServicePort,
    private readonly resources: ExternalResourcePublicServicePort,
    private readonly organizations: OrganizationPublicServicePort,
  ) {}
  async execute(username: string): Promise<PublicProfileDTO> {
    const profile = await this.profileQueryRepository.findByUsername(username, { visibility: 'public' });
    if (!profile?.userId) throw new AppError('PROFILE_NOT_FOUND');
    const accountId = profile.userId;
    const [articles, projects, qAndA, resources, organizations] = await Promise.all([
      this.articles.listPublishedByAuthor(accountId, CONTRIBUTION_LIMIT_PER_OWNER),
      this.projects.listPublishedByAuthor(accountId, CONTRIBUTION_LIMIT_PER_OWNER),
      this.qAndA.listPublicByAuthor(accountId, CONTRIBUTION_LIMIT_PER_OWNER),
      this.resources.listPublishedBySubmitter(accountId, CONTRIBUTION_LIMIT_PER_OWNER),
      this.organizations.listPublicMembershipsByAccount(accountId, CONTRIBUTION_LIMIT_PER_OWNER),
    ]);
    const contributions: PublicProfileContributionDTO[] = [
      ...articles.map((item) => ({ ...item, slug: item.slug, parentId: null, contributionCount: null })),
      ...projects.map((item) => ({ ...item, slug: item.slug, parentId: null, contributionCount: null })),
      ...qAndA.map((item) => ({ ...item, slug: null, contributionCount: null })),
      ...resources.map((item) => ({ ...item, slug: null, parentId: null, contributionCount: null })),
    ].sort((a, b) => (b.occurredAt ?? '').localeCompare(a.occurredAt ?? ''));

    return { ...profile, contributions, organizations };
  }
}
