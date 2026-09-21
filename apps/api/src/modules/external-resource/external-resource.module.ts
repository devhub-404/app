import { forwardRef, Module } from '@nestjs/common';
import { AuthPublicModule } from '@/modules/auth/public/auth-public.module';
import { ResourcesController } from '@/modules/external-resource/presentation/resources.controller';
import {
  ListResourcesQuery,
  GetResourceByIdQuery,
  CreateResourceCommand,
  UpdateResourceCommand,
  DeleteResourceCommand,
  ArchiveResourceCommand,
  UnarchiveResourceCommand,
  ExternalResourcePolicy,
  SuggestExternalResourceCommand,
  ApproveExternalResourceSuggestionCommand,
  RejectExternalResourceSuggestionCommand,
  ListPendingExternalResourceSuggestionsQuery,
  ListMyExternalResourceSuggestionsQuery,
  GetResourceForManagementQuery,
  ListResourcesForManagementQuery,
} from '@/modules/external-resource/application';
import { ExternalResourceRepositoriesModule } from '@/modules/external-resource/infrastructure/resource-repositories.module';
import { TaxonomyPublicModule } from '@/modules/taxonomy/public/taxonomy-public.module';
import { ModerationPublicModule } from '@/modules/moderation/public/moderation-public.module';
import { NotificationPublicModule } from '@/modules/notification/public/notification-public.module';

@Module({
  imports: [
    forwardRef(() => AuthPublicModule),
    ExternalResourceRepositoriesModule,
    TaxonomyPublicModule,
    ModerationPublicModule,
    NotificationPublicModule,
  ],
  providers: [
    ListResourcesQuery,
    GetResourceByIdQuery,
    CreateResourceCommand,
    UpdateResourceCommand,
    ArchiveResourceCommand,
    UnarchiveResourceCommand,
    DeleteResourceCommand,
    ExternalResourcePolicy,
    SuggestExternalResourceCommand,
    ApproveExternalResourceSuggestionCommand,
    RejectExternalResourceSuggestionCommand,
    ListPendingExternalResourceSuggestionsQuery,
    ListMyExternalResourceSuggestionsQuery,
    GetResourceForManagementQuery,
    ListResourcesForManagementQuery,
  ],
  controllers: [ResourcesController],
})
export class ExternalResourceModule {}
