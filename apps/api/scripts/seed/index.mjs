import { createCipheriv, randomBytes } from 'node:crypto';
import { Pool } from 'pg';
import { client, ready, server } from '@serenity-kit/opaque';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../../..');

const seedEnvironment = process.env.APP_ENV;
if (!['development', 'test'].includes(seedEnvironment)) {
  throw new Error('Local seed can only run with APP_ENV=development or APP_ENV=test');
}
const databaseUrl = process.env.DB_PRIMARY_URL;
if (!databaseUrl) throw new Error('DB_PRIMARY_URL is missing from the selected environment file');
const databaseName = seedEnvironment === 'test' ? 'devhub_404_test' : 'devhub_404_dev';
if (!new RegExp(`/${databaseName}(?:\\?|$)`).test(databaseUrl)) {
  throw new Error(`Refusing to seed a non-${seedEnvironment} database`);
}

const resetOnly = process.argv.includes('--reset-only');
const serverSetup = process.env.OPAQUE_SERVER_SETUP;
if (!resetOnly && !serverSetup) throw new Error('OPAQUE_SERVER_SETUP is missing from the selected environment file');

const pool = new Pool({ connectionString: databaseUrl });
const dataDir = resolve(here, 'data');
const allTables = [
  'comment_statistics',
  'view_statistics',
  'vote_statistics',
  'resource_views',
  'resource_votes',
  'tag_follows',
  'resource_reports',
  'comment_reports',
  'resource_bookmarks',
  'comments',
  'notifications',
  'account_restrictions',
  'news_suggestions',
  'event_suggestions',
  'answers',
  'questions',
  'events',
  'jobs',
  'job_suggestions',
  'projects',
  'articles',
  'news',
  'resources',
  'external_resources',
  'external_resource_suggestions',
  'news_references',
  'tag_merges',
  'tag_aliases',
  'tag_identity_terms',
  'resource_tags',
  'tags',
  'media_objects',
  'feedback',
  'organization_memberships',
  'organizations',
  'credential_oauth',
  'credential_passkey',
  'mfa_recovery_code',
  'mfa_totp',
  'sessions',
  'auth_flow_proof',
  'credential_password',
  'credential',
  'account_roles',
  'account_preferences',
  'profiles',
  'account_emails',
  'accounts',
  'roles',
  'sources',
];

async function readJson(file) {
  return JSON.parse(await readFile(resolve(dataDir, file), 'utf8'));
}

function identifier(value) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) throw new Error(`Unsafe seed identifier: ${value}`);
  return `"${value}"`;
}

function columnName(value) {
  return value.includes('_') ? value : value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function insertRows(db, table, rows) {
  if (!rows) return;
  for (const row of rows) {
    const entries = Object.entries(row).filter(([, value]) => value !== undefined);
    if (!entries.length) continue;
    const columns = entries.map(([column]) => identifier(columnName(column))).join(', ');
    const placeholders = entries.map((_, index) => `$${index + 1}`).join(', ');
    await db.query(
      `INSERT INTO ${identifier(table)} (${columns}) VALUES (${placeholders})`,
      entries.map(([, value]) => (value !== null && typeof value === 'object' ? JSON.stringify(value) : value)),
    );
  }
}

async function opaqueVerifier(opaqueUserIdentifier, password) {
  await ready;
  const registration = client.startRegistration({ password });
  const response = server.createRegistrationResponse({
    serverSetup,
    userIdentifier: opaqueUserIdentifier,
    registrationRequest: registration.registrationRequest,
  });
  const finished = client.finishRegistration({
    password,
    registrationResponse: response.registrationResponse,
    clientRegistrationState: registration.clientRegistrationState,
  });
  return finished.registrationRecord;
}

function encryptTotpSecret(secret) {
  const rawKey = process.env.AUTH_TOTP_SECRET_ENCRYPTION_KEY_BASE64;
  if (!rawKey) throw new Error('AUTH_TOTP_SECRET_ENCRYPTION_KEY_BASE64 is missing');
  const key = Buffer.from(rawKey, 'base64');
  if (key.length !== 32) throw new Error('AUTH_TOTP_SECRET_ENCRYPTION_KEY_BASE64 must be 32 bytes');

  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  return Buffer.from(
    JSON.stringify({
      v: 1,
      iv: iv.toString('base64'),
      tag: cipher.getAuthTag().toString('base64'),
      ct: ciphertext.toString('base64'),
    }),
    'utf8',
  ).toString('base64');
}

async function seedAccounts(db, accounts, roles) {
  const roleIds = new Map(roles.map((role) => [role.name, role.id]));
  for (const account of accounts) {
    await insertRows(db, 'accounts', [
      {
        id: account.id,
        voluntary_status: 'active',
        moderation_status: 'none',
        deletion_status: 'none',
        mfa_enabled: Boolean(account.totpSecret),
      },
    ]);
    await insertRows(db, 'account_emails', [
      {
        id: account.emailId,
        user_id: account.id,
        email: account.email,
        type: 'primary',
        verified_at: '2026-08-01T12:00:00.000Z',
      },
    ]);
    await insertRows(db, 'profiles', [
      {
        user_id: account.id,
        username: account.username,
        display_name: account.displayName,
        headline: account.headline,
        bio: account.bio,
        location: account.location,
      },
    ]);
    await insertRows(db, 'account_preferences', [
      {
        user_id: account.id,
        locale: account.locale,
        profile_visibility: 'public',
      },
    ]);
    await insertRows(db, 'credential', [{ id: account.credentialId, user_id: account.id, type: 'password' }]);
    const verifier = await opaqueVerifier(account.credentialId, account.password);
    await insertRows(db, 'credential_password', [
      { id: account.credentialId, verifier, opaque_user_identifier: account.credentialId, scheme: 'OPAQUE' },
    ]);
    if (account.totpSecret) {
      await insertRows(db, 'mfa_totp', [
        {
          id: account.mfaTotpId,
          user_id: account.id,
          encrypted_secret: encryptTotpSecret(account.totpSecret),
          status: 'active',
        },
      ]);
    }
    await insertRows(
      db,
      'account_roles',
      account.roles.map((role) => ({ user_id: account.id, role_id: roleIds.get(role) })),
    );
  }
}

async function seedStatistics(db, rows = []) {
  for (const row of rows) {
    const { targetType, contentId, voteCount, viewCount, commentCount } = row;
    if (['article', 'resource', 'question', 'answer'].includes(targetType)) {
      await insertRows(db, 'vote_statistics', [{ resourceId: contentId, voteCount }]);
    }
    if (['article', 'news', 'project', 'event'].includes(targetType)) {
      await insertRows(db, 'view_statistics', [{ resourceId: contentId, viewCount }]);
    }
    if (targetType === 'article') {
      await insertRows(db, 'comment_statistics', [{ resourceId: contentId, commentCount }]);
    }
  }
}

async function seedNews(db, rows = []) {
  await insertRows(db, 'news', rows);
}

async function seedNewsSuggestions(db, rows = []) {
  await insertRows(
    db,
    'news_suggestions',
    rows.map(({ newsId, resolvedAt, ...suggestion }) => ({
      ...suggestion,
      acceptedNewsId: newsId ?? null,
      decidedAt: resolvedAt ?? null,
    })),
  );
}

async function seedResources(db, rows = []) {
  await insertRows(db, 'external_resources', rows);
}

async function seedComments(db, rows = []) {
  await insertRows(db, 'comments', rows);
}

async function main() {
  const manifest = await readJson('manifest.json');
  const data = {};
  for (const [name, file] of Object.entries(manifest.files)) data[name] = await readJson(file);
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    await db.query(`TRUNCATE TABLE ${allTables.map(identifier).join(', ')} RESTART IDENTITY CASCADE`);

    if (resetOnly) {
      await db.query('COMMIT');
      console.log(`${seedEnvironment} database reset.`);
      return;
    }

    await insertRows(db, 'roles', data.roles);
    await seedAccounts(db, data.accounts, data.roles);
    await insertRows(db, 'media_objects', data.mediaObjects);
    await insertRows(db, 'resources', [
      ...(data.articles ?? []).map(({ id }) => ({ id, kind: 'article' })),
      ...(data.news ?? []).map(({ id }) => ({ id, kind: 'news' })),
      ...(data.resources ?? []).map(({ id }) => ({ id, kind: 'external_resource' })),
      ...(data.projects ?? []).map(({ id }) => ({ id, kind: 'project' })),
      ...(data.jobs ?? []).map(({ id }) => ({ id, kind: 'job' })),
      ...(data.events ?? []).map(({ id }) => ({ id, kind: 'event' })),
      ...(data.questions ?? []).map(({ id }) => ({ id, kind: 'question' })),
      ...(data.answers ?? []).map(({ id }) => ({ id, kind: 'answer' })),
    ]);
    await insertRows(db, 'tags', data.tags);
    await insertRows(db, 'tag_aliases', data.tagAliases);
    await insertRows(db, 'tag_identity_terms', data.tagIdentityTerms);
    await insertRows(db, 'tag_merges', data.tagMerges);
    await insertRows(db, 'sources', data.sources);
    await insertRows(db, 'articles', data.articles);
    await seedNews(db, data.news);
    await insertRows(db, 'news_references', data.newsReferences);
    await seedNewsSuggestions(db, data.newsSuggestions);
    await seedResources(db, data.resources);
    await insertRows(
      db,
      'external_resource_suggestions',
      data.resourceSubmissions.map(
        ({ resourceId, submitterId, reviewNote, decidedByAccountId, decidedAt, ...suggestion }) => ({
          ...suggestion,
          status: suggestion.status === 'approved' ? 'accepted' : suggestion.status,
          submittedByAccountId: submitterId,
          acceptedExternalResourceId: resourceId ?? null,
          decisionNote: reviewNote ?? null,
          decidedByAccountId: decidedByAccountId ?? null,
          decidedAt: decidedAt ?? null,
        }),
      ),
    );
    await insertRows(db, 'questions', data.questions);
    await insertRows(db, 'answers', data.answers);
    for (const answer of data.answers.filter((item) => item.acceptedAt)) {
      await db.query('UPDATE questions SET accepted_answer_id = $2 WHERE id = $1', [answer.questionId, answer.id]);
    }
    await insertRows(db, 'projects', data.projects);
    await insertRows(
      db,
      'jobs',
      data.jobs.map(({ publicationType, submittedByAccountId, ...job }) => ({ ...job, publisherOrganizationId: null })),
    );
    await insertRows(
      db,
      'events',
      data.events.map(({ normalizedUrl, submittedByAccountId, approvedAt, resolvedAt, rejectionReason, ...event }) => ({
        ...event,
        slug: event.slug ?? slugify(event.title),
        status:
          event.status === 'approved' || event.status === 'accepted'
            ? 'published'
            : event.status === 'pending'
              ? 'draft'
              : event.status === 'rejected'
                ? 'archived'
                : event.status,
      })),
    );
    await insertRows(
      db,
      'event_suggestions',
      data.eventSuggestions.map(({ normalizedUrl, eventId, resolvedAt, ...suggestion }) => ({
        ...suggestion,
        acceptedEventId: eventId ?? null,
        decidedAt: resolvedAt ?? null,
      })),
    );
    await insertRows(db, 'organizations', data.organizations);
    await insertRows(db, 'organization_memberships', data.organizationMemberships);
    await insertRows(
      db,
      'resource_tags',
      data.contentTagAssignments.map(({ targetId, tagId }) => ({ resourceId: targetId, tagId })),
    );
    await insertRows(db, 'tag_follows', data.tagFollows);
    await insertRows(db, 'resource_reports', data.resourceReports);
    await insertRows(db, 'job_suggestions', data.jobSuggestions);
    await insertRows(db, 'external_resource_suggestions', data.externalResourceSuggestions);
    await insertRows(
      db,
      'resource_votes',
      data.votes.map(({ targetId, targetType, ...vote }) => ({ ...vote, resourceId: targetId })),
    );
    await insertRows(
      db,
      'resource_bookmarks',
      data.bookmarks.map(({ targetId, targetType, ...bookmark }) => ({ ...bookmark, resourceId: targetId })),
    );
    await insertRows(
      db,
      'resource_views',
      data.views.map(({ targetId, targetType, ...view }) => ({ ...view, resourceId: targetId })),
    );
    await seedComments(
      db,
      data.comments.map(({ contentId, targetType, userId, ...comment }) => ({
        ...comment,
        resourceId: contentId,
        authorAccountId: userId,
      })),
    );
    await insertRows(db, 'comment_reports', data.commentReports);
    await insertRows(db, 'notifications', data.notifications);
    await insertRows(db, 'account_restrictions', data.accountRestrictions);
    await insertRows(db, 'feedback', data.feedback);
    await seedStatistics(db, data.statistics);
    await insertRows(db, 'auth_flow_proof', data.authFlowProofs);
    // The password credential is created with each account. These two extra
    // credentials keep the local database useful for OAuth/passkey flows too.
    await insertRows(
      db,
      'credential',
      data.oauthCredentials.map(({ id, userId }) => ({ id, userId, type: 'oauth' })),
    );
    await insertRows(
      db,
      'credential_oauth',
      data.oauthCredentials.map(({ userId, ...credential }) => credential),
    );
    await insertRows(
      db,
      'credential',
      data.passkeys.map(({ id, userId }) => ({ id, userId, type: 'passkey' })),
    );
    await insertRows(
      db,
      'credential_passkey',
      data.passkeys.map(({ userId, ...passkey }) => passkey),
    );
    await insertRows(db, 'mfa_totp', data.mfaTotp);
    await insertRows(db, 'mfa_recovery_code', data.mfaRecoveryCodes);
    await insertRows(db, 'sessions', data.sessions);
    await db.query('COMMIT');

    const localDir = resolve(repoRoot, '.local');
    await mkdir(localDir, { recursive: true });
    await writeFile(
      resolve(localDir, seedEnvironment === 'test' ? 'seed-credentials-test.json' : 'seed-credentials.json'),
      `${JSON.stringify({ note: 'Somente ambientes locais. Segredos TOTP são exclusivos deste seed.', accounts: data.accounts.map(({ email, password, username, roles, totpSecret }) => ({ email, password, username, roles, totpSecret })) }, null, 2)}\n`,
      'utf8',
    );
    console.log(`${seedEnvironment} seed applied from ${Object.keys(manifest.files).length} JSON datasets.`);
    console.log('  member@devhub-404.local / DevHub-Member-2026!');
    console.log('  moderator@devhub-404.local / DevHub-Moderator-2026!');
    console.log('  admin@devhub-404.local  / DevHub-Admin-2026!');
  } catch (error) {
    await db.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    db.release();
    await pool.end();
  }
}

await main();
