import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MediaServicePort } from '@/modules/media/public';
import { ProfileRepository } from '@/modules/account/application/profile/ports/profile.repository';
import { ACCOUNT_CREATED_EVENT, AccountCreatedEvent } from '@/modules/account/public/events';

@Injectable()
export class ImportOAuthAvatarOnAccountCreatedListener {
  private readonly logger = new Logger(ImportOAuthAvatarOnAccountCreatedListener.name);

  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly mediaService: MediaServicePort,
  ) {}

  @OnEvent(ACCOUNT_CREATED_EVENT)
  async handle(event: AccountCreatedEvent): Promise<void> {
    if (!event.avatar?.avatarUrl) return;

    const profile = await this.profileRepository.findById(event.userId);
    if (!profile || profile.avatarMediaId) return;

    const asset = await this.mediaService.importOAuthAvatar({
      ownerId: event.userId,
      purpose: 'avatar',
      source: 'oauth',
      provider: event.avatar.provider,
      sourceUrl: event.avatar.avatarUrl,
    });
    if (!asset) return;

    try {
      profile.update({ avatarMediaId: asset.mediaId, avatarUrl: null });
      await this.profileRepository.save(profile);
    } catch (error) {
      this.logger.warn(`OAuth avatar profile association failed for ${event.userId}: ${String(error)}`);
      await this.mediaService.deleteImage({ ownerId: event.userId, mediaId: asset.mediaId }).catch(() => undefined);
    }
  }
}
