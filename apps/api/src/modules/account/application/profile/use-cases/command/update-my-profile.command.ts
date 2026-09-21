import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { UpdateProfileDTO } from '@/modules/account/application/profile/dtos/in';
import {
  type SocialLinks,
  type SocialLinksInput,
  type UpdateProfileProps,
} from '@/modules/account/domain/entities/profile';
import { ProfileRepository } from '@/modules/account/application/profile/ports/profile.repository';
import { ProfileQueryRepository } from '@/modules/account/application/profile/ports/profile.query.repository';
import { MediaServicePort } from '@/modules/media/public';
import { GetMyProfileQuery } from '@/modules/account/application/profile/use-cases/query/get-my-profile.query';
import { ProfileDTO } from '@/modules/account/application/profile/dtos/out';

@Injectable()
export class UpdateMyProfileCommand {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly profileQueryRepository: ProfileQueryRepository,
    private readonly getMeProfileQuery: GetMyProfileQuery,
    private readonly mediaService: MediaServicePort,
  ) {}

  async execute(userId: string, payload: UpdateProfileDTO): Promise<ProfileDTO> {
    const profile = await this.profileRepository.findById(userId);
    if (!profile) {
      throw new AppError('PROFILE_NOT_FOUND');
    }

    if (payload.username !== undefined && payload.username !== profile.username) {
      const usernameAlreadyExists = await this.profileQueryRepository.existsByUsername(payload.username, userId);
      if (usernameAlreadyExists) {
        throw new AppError('PROFILE_ALREADY_EXISTS');
      }
    }

    const previousAvatarMediaId = profile.avatarMediaId;
    profile.update(await buildUpdateProps(this.mediaService, userId, payload));
    await this.profileRepository.save(profile);
    if (
      payload.avatarMediaId !== undefined &&
      previousAvatarMediaId &&
      previousAvatarMediaId !== profile.avatarMediaId
    ) {
      // This cleanup is explicitly best-effort, but it is still awaited so a
      // serverless invocation never relies on work continuing after the response.
      await this.mediaService.deleteImage({ ownerId: userId, mediaId: previousAvatarMediaId }).catch(() => undefined);
    }

    return await this.getMeProfileQuery.execute(userId);
  }
}

async function buildUpdateProps(
  mediaService: MediaServicePort,
  userId: string,
  payload: UpdateProfileDTO,
): Promise<UpdateProfileProps> {
  const { githubUrl, linkedinUrl, twitterUrl, avatarMediaId, ...rest } = payload;
  const definedRest = Object.fromEntries(
    Object.entries(rest).filter(([, value]) => value !== undefined),
  ) as typeof rest;
  const avatar = await resolveAvatarAsset(mediaService, userId, payload.avatarMediaId);
  const socialLinks = mapSocialLinks(githubUrl, linkedinUrl, twitterUrl);

  return {
    ...definedRest,
    avatarUrl: null,
    ...(avatar ? { avatarMediaId: avatar.mediaId } : avatarMediaId === null ? { avatarMediaId: null } : {}),
    ...(socialLinks !== undefined ? { socialLinks } : {}),
  };
}

async function resolveAvatarAsset(
  mediaService: MediaServicePort,
  userId: string,
  avatarMediaId?: string | null,
): Promise<{ mediaId: string } | null | undefined> {
  if (avatarMediaId === undefined) {
    return undefined;
  }

  if (avatarMediaId === null || avatarMediaId.length === 0) {
    return null;
  }

  const asset = await mediaService.confirmImageUpload({
    ownerId: userId,
    purpose: 'avatar',
    mediaId: avatarMediaId,
  });

  if (!asset) {
    throw new AppError('UPLOAD_ASSET_NOT_AVAILABLE');
  }

  return asset;
}

function mapSocialLinks(
  githubUrl?: string | null,
  linkedinUrl?: string | null,
  twitterUrl?: string | null,
): (SocialLinks & SocialLinksInput) | null | undefined {
  if (githubUrl === undefined && linkedinUrl === undefined && twitterUrl === undefined) {
    return undefined;
  }

  return {
    githubUrl: githubUrl ?? null,
    linkedinUrl: linkedinUrl ?? null,
    twitterUrl: twitterUrl ?? null,
  };
}
