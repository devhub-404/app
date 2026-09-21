import { forwardRef, Module } from '@nestjs/common';
import { AuthPublicModule } from '@/modules/auth/public/auth-public.module';
import { TaxonomyTagsController } from '@/modules/taxonomy/presentation/tags.controller';
import { SearchTagsQuery } from '@/modules/taxonomy/application/tag/use-cases/query/search-tags.query';
import { SearchTagsPageQuery } from '@/modules/taxonomy/application/tag/use-cases/query/search-tags-page.query';
import { CreateTagCommand } from '@/modules/taxonomy/application/tag/use-cases/command/create-tag.command';
import { UpdateTagCommand } from '@/modules/taxonomy/application/tag/use-cases/command/update-tag.command';
import { DeleteTagCommand } from '@/modules/taxonomy/application/tag/use-cases/command/delete-tag.command';
import { MergeTagsCommand } from '@/modules/taxonomy/application/tag/use-cases/command/merge-tags.command';
import { ResolveTagQuery } from '@/modules/taxonomy/application/tag/use-cases/query/resolve-tag.query';
import { TaxonomyTagRepositoriesModule } from '@/modules/taxonomy/infrastructure/taxonomy-tag-repositories.module';
import { CreateTagAliasCommand } from '@/modules/taxonomy/application/tag/use-cases/command/create-tag-alias.command';
import { DeleteTagAliasCommand } from '@/modules/taxonomy/application/tag/use-cases/command/delete-tag-alias.command';
import { SetTagIdentityTermCommand } from '@/modules/taxonomy/application/tag/use-cases/command/set-tag-identity-term.command';
import { DeleteTagIdentityTermCommand } from '@/modules/taxonomy/application/tag/use-cases/command/delete-tag-identity-term.command';
import { ArchiveTagCommand } from '@/modules/taxonomy/application/tag/use-cases/command/archive-tag.command';
import { UnarchiveTagCommand } from '@/modules/taxonomy/application/tag/use-cases/command/unarchive-tag.command';
import { ListTagAliasesQuery } from '@/modules/taxonomy/application/tag/use-cases/query/list-tag-aliases.query';
import { ListTagIdentityTermsQuery } from '@/modules/taxonomy/application/tag/use-cases/query/list-tag-identity-terms.query';
import { AccountRestrictionPublicModule } from '@/modules/moderation/public/account-restriction-public.module';
import { TaxonomyPublicModule } from '@/modules/taxonomy/public/taxonomy-public.module';
import { ReplaceTargetTagsCommand } from '@/modules/taxonomy/application/tag/use-cases/command/replace-target-tags.command';
import { RemoveResourceTagsCommand } from '@/modules/taxonomy/application/tag/use-cases/command/remove-resource-tags.command';
import { TaxonomyManifestValidator } from '@/modules/taxonomy/application/integration/taxonomy-manifest.validator';

@Module({
  imports: [
    forwardRef(() => AuthPublicModule),
    TaxonomyTagRepositoriesModule,
    AccountRestrictionPublicModule,
    TaxonomyPublicModule,
  ],
  providers: [
    SearchTagsQuery,
    SearchTagsPageQuery,
    CreateTagCommand,
    UpdateTagCommand,
    DeleteTagCommand,
    MergeTagsCommand,
    ResolveTagQuery,
    CreateTagAliasCommand,
    DeleteTagAliasCommand,
    SetTagIdentityTermCommand,
    DeleteTagIdentityTermCommand,
    ArchiveTagCommand,
    UnarchiveTagCommand,
    ListTagAliasesQuery,
    ListTagIdentityTermsQuery,
    ReplaceTargetTagsCommand,
    RemoveResourceTagsCommand,
    TaxonomyManifestValidator,
  ],
  controllers: [TaxonomyTagsController],
})
export class TaxonomyModule {}
