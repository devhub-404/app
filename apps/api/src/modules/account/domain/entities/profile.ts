import { DomainError } from '@/shared/errors/domain-error';

export type SocialLinks = {
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
};

export type SocialLinksInput = Partial<SocialLinks>;

export interface ProfileProps {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  avatarMediaId: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  portfolioUrl: string | null;
  socialLinks: SocialLinks | null;
}

export type CreateProfileProps = Omit<ProfileProps, 'userId'> & { socialLinks?: SocialLinksInput | null };
export type UpdateProfileProps = Partial<Omit<ProfileProps, 'userId'>> & { socialLinks?: SocialLinksInput | null };

export const USERNAME_MAX_LENGTH = 50;
export const DISPLAY_NAME_MAX_LENGTH = 100;
export const HEADLINE_MAX_LENGTH = 160;
export const BIO_MAX_LENGTH = 500;
export const LOCATION_MAX_LENGTH = 120;
export const AVATAR_URL_MAX_LENGTH = 2048;
export const PORTFOLIO_URL_MAX_LENGTH = 2048;
export const SOCIAL_LINK_MAX_LENGTH = 2048;

export class Profile {
  private constructor(private props: ProfileProps) {
    this.validate();
  }

  get userId() {
    return this.props.userId;
  }
  get username() {
    return this.props.username;
  }
  get displayName() {
    return this.props.displayName;
  }
  get avatarUrl() {
    return this.props.avatarUrl;
  }
  get avatarMediaId() {
    return this.props.avatarMediaId;
  }
  get headline() {
    return this.props.headline;
  }
  get bio() {
    return this.props.bio;
  }
  get location() {
    return this.props.location;
  }
  get portfolioUrl() {
    return this.props.portfolioUrl;
  }
  get socialLinks() {
    return this.props.socialLinks ? { ...this.props.socialLinks } : null;
  }

  static create(userId: string, input: CreateProfileProps): Profile {
    return new Profile({
      userId,
      username: input.username,
      displayName: input.displayName ?? null,
      avatarUrl: input.avatarUrl ?? null,
      avatarMediaId: input.avatarMediaId ?? null,
      headline: input.headline ?? null,
      bio: input.bio ?? null,
      location: input.location ?? null,
      portfolioUrl: input.portfolioUrl ?? null,
      socialLinks: normalizeSocialLinks(input.socialLinks),
    });
  }

  static rehydrate(props: ProfileProps): Profile {
    return new Profile({ ...props, socialLinks: normalizeSocialLinks(props.socialLinks) });
  }

  update(input: UpdateProfileProps): void {
    this.props = {
      ...this.props,
      ...input,
      socialLinks: input.socialLinks === undefined ? this.props.socialLinks : normalizeSocialLinks(input.socialLinks),
    };
    this.validate();
  }

  private validate(): void {
    if (!this.props.username || this.props.username.length > USERNAME_MAX_LENGTH)
      throw new DomainError('USER_PROFILE_INVALID_USERNAME');
    assertLength(this.props.displayName, DISPLAY_NAME_MAX_LENGTH, 'USER_PROFILE_INVALID_DISPLAY_NAME');
    assertLength(this.props.headline, HEADLINE_MAX_LENGTH, 'USER_PROFILE_INVALID_HEADLINE');
    assertLength(this.props.bio, BIO_MAX_LENGTH, 'USER_PROFILE_INVALID_BIO');
    assertLength(this.props.location, LOCATION_MAX_LENGTH, 'USER_PROFILE_INVALID_LOCATION');
    assertLength(this.props.avatarUrl, AVATAR_URL_MAX_LENGTH, 'USER_PROFILE_INVALID_AVATAR_URL');
    assertLength(this.props.portfolioUrl, PORTFOLIO_URL_MAX_LENGTH, 'USER_PROFILE_INVALID_PORTFOLIO_URL');
    if (this.props.socialLinks) {
      for (const value of Object.values(this.props.socialLinks))
        assertLength(value, SOCIAL_LINK_MAX_LENGTH, 'USER_PROFILE_INVALID_SOCIAL_LINK');
    }
  }
}

function assertLength(value: string | null | undefined, max: number, code: string) {
  if (value && value.length > max) throw new DomainError(code);
}

function normalizeSocialLinks(input: SocialLinksInput | null | undefined): SocialLinks | null {
  if (!input) return null;
  const links: SocialLinks = {
    githubUrl: input.githubUrl ?? null,
    linkedinUrl: input.linkedinUrl ?? null,
    twitterUrl: input.twitterUrl ?? null,
  };

  return Object.values(links).every((value) => !value) ? null : links;
}
