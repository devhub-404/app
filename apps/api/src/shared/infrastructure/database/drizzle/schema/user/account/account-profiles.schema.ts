import { jsonb, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { accountsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/accounts.schema';
import { mediaObjectsSchema } from '../../media/media-objects.schema';

type SocialLinks = {
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
};

export const accountProfileSchema = pgTable('profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => accountsSchema.id, { onDelete: 'cascade' }),
  username: varchar('username', { length: 50 }).unique().notNull(),
  displayName: varchar('display_name', { length: 100 }),
  avatarMediaId: uuid('avatar_media_id').references(() => mediaObjectsSchema.id, { onDelete: 'set null' }),
  headline: varchar('headline', { length: 160 }),
  bio: varchar('bio', { length: 500 }),
  location: varchar('location', { length: 120 }),
  portfolioUrl: varchar('portfolio_url', { length: 2048 }),
  socialLinks: jsonb('social_links').$type<SocialLinks | null>(),
});
