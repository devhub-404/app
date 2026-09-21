import { boolean, integer, jsonb, pgEnum, pgTable, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { credentialSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential.schema';

export const passkeyDeviceTypeEnum = pgEnum('passkey_device_type', ['single_device', 'multi_device']);

export const credentialPasskeySchema = pgTable(
  'credential_passkey',
  {
    id: uuid('id')
      .primaryKey()
      .references(() => credentialSchema.id, { onDelete: 'cascade' }),
    webauthnId: varchar('webauthn_id', { length: 1024 }).notNull(),
    publicKey: varchar('public_key', { length: 4096 }).notNull(),
    counter: integer('counter').notNull().default(0),
    deviceType: passkeyDeviceTypeEnum('device_type').notNull(),
    backedUp: boolean('backed_up').notNull().default(false),
    transports: jsonb('transports').$type<string[] | null>(),
    deviceName: varchar('device_name', { length: 100 }),
  },
  (table) => ({
    webauthnIdIdx: uniqueIndex('credential_passkey_webauthn_id_idx').on(table.webauthnId),
  }),
);
