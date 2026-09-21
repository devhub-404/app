CREATE TYPE "public"."article_status" AS ENUM('draft', 'archived', 'published');--> statement-breakpoint
CREATE TYPE "public"."feedback_category" AS ENUM('bug', 'issue', 'suggestion');--> statement-breakpoint
CREATE TYPE "public"."feedback_status" AS ENUM('open', 'in_review', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."event_format" AS ENUM('online', 'in_person', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."event_suggestion_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."external_resource_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."external_resource_suggestion_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."job_compensation_unit" AS ENUM('hourly', 'daily', 'monthly', 'yearly', 'fixed_project');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('published', 'closed', 'expired', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."job_suggestion_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('full_time', 'part_time', 'contract', 'internship', 'temporary');--> statement-breakpoint
CREATE TYPE "public"."job_workplace_type" AS ENUM('remote', 'hybrid', 'onsite');--> statement-breakpoint
CREATE TYPE "public"."media_object_purpose" AS ENUM('avatar', 'content');--> statement-breakpoint
CREATE TYPE "public"."media_object_status" AS ENUM('pending', 'confirmed', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."restriction_capability" AS ENUM('CONTRIBUTION', 'COMMENT', 'VOTE', 'JOB_PUBLISH');--> statement-breakpoint
CREATE TYPE "public"."news_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."news_suggestion_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."question_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."resource_kind" AS ENUM('article', 'news', 'external_resource', 'project', 'event', 'job', 'question', 'answer');--> statement-breakpoint
CREATE TYPE "public"."tag_identity_term_kind" AS ENUM('reserved', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."tag_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."user_email_type" AS ENUM('primary', 'backup');--> statement-breakpoint
CREATE TYPE "public"."profile_visibility" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TYPE "public"."account_deletion_status" AS ENUM('none', 'pending');--> statement-breakpoint
CREATE TYPE "public"."account_moderation_status" AS ENUM('none', 'suspended', 'banned');--> statement-breakpoint
CREATE TYPE "public"."account_voluntary_status" AS ENUM('active', 'deactivated');--> statement-breakpoint
CREATE TYPE "public"."role_name" AS ENUM('curator', 'admin', 'moderator');--> statement-breakpoint
CREATE TYPE "public"."passkey_device_type" AS ENUM('single_device', 'multi_device');--> statement-breakpoint
CREATE TYPE "public"."password_scheme" AS ENUM('OPAQUE');--> statement-breakpoint
CREATE TYPE "public"."credential_type" AS ENUM('password', 'oauth', 'passkey');--> statement-breakpoint
CREATE TYPE "public"."mfa_totp_status" AS ENUM('pending', 'active', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."auth_method" AS ENUM('password', 'magic_link', 'oauth', 'passkey', 'restore_access');--> statement-breakpoint
CREATE TYPE "public"."organization_membership_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."organization_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."organization_type" AS ENUM('company', 'community', 'open_source', 'foundation', 'group', 'institution', 'other');--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"author_id" uuid NOT NULL,
	"title" varchar(180) NOT NULL,
	"description" varchar(320) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"cover_media_id" uuid,
	"content" varchar(20000) NOT NULL,
	"content_version" integer DEFAULT 1 NOT NULL,
	"reading_time_minutes" smallint DEFAULT 1 NOT NULL,
	"comments_enabled" boolean DEFAULT true NOT NULL,
	"status" "article_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"hidden_at" timestamp,
	"hide_reason" varchar(1000),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "resource_bookmarks" (
	"account_id" uuid NOT NULL,
	"resource_id" uuid NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "resource_bookmarks_account_id_resource_id_pk" PRIMARY KEY("account_id","resource_id")
);
--> statement-breakpoint
CREATE TABLE "comment_statistics" (
	"resource_id" uuid PRIMARY KEY NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"resource_id" uuid NOT NULL,
	"author_account_id" uuid,
	"parent_id" uuid,
	"body" varchar(1000),
	"edited_at" timestamp,
	"hidden_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "comments_id_resource_uq" UNIQUE("id","resource_id"),
	CONSTRAINT "comments_tombstone_consistency" CHECK (("comments"."deleted_at" IS NULL AND "comments"."body" IS NOT NULL) OR ("comments"."deleted_at" IS NOT NULL AND "comments"."body" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"reporter_account_id" uuid,
	"idempotency_key" varchar(128),
	"category" "feedback_category" NOT NULL,
	"description" varchar(20000) NOT NULL,
	"context_url" varchar(2048),
	"screenshot_media_id" uuid,
	"status" "feedback_status" DEFAULT 'open' NOT NULL,
	"internal_severity" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"account_id" uuid NOT NULL,
	"type" varchar(64) NOT NULL,
	"target_type" varchar(64),
	"target_id" varchar(255),
	"source_type" varchar(64),
	"source_id" varchar(255),
	"seen_at" timestamp,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"url" varchar(2048) NOT NULL,
	"submitted_by_account_id" uuid,
	"status" "event_suggestion_status" DEFAULT 'pending' NOT NULL,
	"accepted_event_id" uuid,
	"decided_by_account_id" uuid,
	"decision_note" varchar(2000),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(180) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"description" varchar(20000) NOT NULL,
	"cover_media_id" uuid,
	"url" varchar(2048) NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"format" "event_format" NOT NULL,
	"location" varchar(240),
	"status" "event_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "external_resource_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"accepted_external_resource_id" uuid,
	"submitted_by_account_id" uuid,
	"url" varchar(2048) NOT NULL,
	"status" "external_resource_suggestion_status" DEFAULT 'pending' NOT NULL,
	"decision_note" varchar(2000),
	"decided_by_account_id" uuid,
	"decided_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "external_resources" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(180) NOT NULL,
	"description" varchar(320) NOT NULL,
	"url" varchar(2048) NOT NULL,
	"status" "external_resource_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tag_follows" (
	"account_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tag_follows_account_id_tag_id_pk" PRIMARY KEY("account_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "job_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"submitted_by_account_id" uuid,
	"title" varchar(180) NOT NULL,
	"description" varchar(20000) NOT NULL,
	"employment_type" "job_type" NOT NULL,
	"workplace_type" "job_workplace_type" NOT NULL,
	"location" varchar(240),
	"compensation_min" numeric(14, 2),
	"compensation_max" numeric(14, 2),
	"compensation_currency" varchar(3),
	"compensation_unit" "job_compensation_unit",
	"application_url" varchar(2048) NOT NULL,
	"source_url" varchar(2048),
	"tag_slugs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "job_suggestion_status" DEFAULT 'pending' NOT NULL,
	"accepted_job_id" uuid,
	"decided_by_account_id" uuid,
	"decision_note" varchar(2000),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"decided_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"publisher_organization_id" uuid,
	"title" varchar(180) NOT NULL,
	"description" varchar(20000) NOT NULL,
	"employment_type" "job_type" NOT NULL,
	"workplace_type" "job_workplace_type" NOT NULL,
	"location" varchar(240),
	"compensation_min" numeric(14, 2),
	"compensation_max" numeric(14, 2),
	"compensation_currency" varchar(3),
	"compensation_unit" "job_compensation_unit",
	"application_url" varchar(2048) NOT NULL,
	"source_url" varchar(2048),
	"status" "job_status" DEFAULT 'published' NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"closed_at" timestamp,
	"withdrawn_at" timestamp,
	"hidden_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_compensation_ck" CHECK (("jobs"."compensation_min" IS NULL AND "jobs"."compensation_max" IS NULL AND "jobs"."compensation_currency" IS NULL AND "jobs"."compensation_unit" IS NULL) OR ("jobs"."compensation_min" IS NOT NULL AND ("jobs"."compensation_max" IS NULL OR "jobs"."compensation_max" >= "jobs"."compensation_min") AND "jobs"."compensation_currency" IS NOT NULL AND "jobs"."compensation_unit" IS NOT NULL)),
	CONSTRAINT "jobs_application_url_https_ck" CHECK ("jobs"."application_url" ~* '^https://'),
	CONSTRAINT "jobs_source_url_https_ck" CHECK ("jobs"."source_url" IS NULL OR "jobs"."source_url" ~* '^https://')
);
--> statement-breakpoint
CREATE TABLE "media_objects" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"owner_account_id" uuid NOT NULL,
	"purpose" "media_object_purpose" NOT NULL,
	"object_key" varchar(1024) NOT NULL,
	"content_type" varchar(128) NOT NULL,
	"size" integer NOT NULL,
	"status" "media_object_status" DEFAULT 'pending' NOT NULL,
	"confirmed_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account_restrictions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"account_id" uuid NOT NULL,
	"capability" "restriction_capability" NOT NULL,
	"reason" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"applied_by_account_id" uuid NOT NULL,
	"revoked_at" timestamp with time zone,
	"revoked_by_account_id" uuid,
	"revoke_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_references" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"news_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	"url" varchar(2048) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(180) NOT NULL,
	"description" varchar(320) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"cover_media_id" uuid,
	"content" varchar(20000) NOT NULL,
	"content_version" integer DEFAULT 1 NOT NULL,
	"comments_enabled" boolean DEFAULT true NOT NULL,
	"status" "news_status" DEFAULT 'draft' NOT NULL,
	"occurred_at" timestamp,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "news_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "news_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"url" varchar(2048) NOT NULL,
	"submitted_by_account_id" uuid,
	"status" "news_suggestion_status" DEFAULT 'pending' NOT NULL,
	"accepted_news_id" uuid,
	"decided_by_account_id" uuid,
	"decision_note" varchar(2000),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"decided_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" varchar(120) NOT NULL,
	"domain" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sources_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY NOT NULL,
	"author_account_id" uuid NOT NULL,
	"title" varchar(180) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"summary" varchar(320) NOT NULL,
	"description" varchar(20000) NOT NULL,
	"project_url" varchar(2048),
	"repository_url" varchar(2048),
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"hidden_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "answers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"question_id" uuid NOT NULL,
	"author_account_id" uuid,
	"content" varchar(20000) NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"hidden_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "answers_id_question_uq" UNIQUE("id","question_id")
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"author_account_id" uuid,
	"title" varchar(180) NOT NULL,
	"content" varchar(20000) NOT NULL,
	"status" "question_status" DEFAULT 'open' NOT NULL,
	"accepted_answer_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"hidden_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "comment_reports" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"comment_id" uuid NOT NULL,
	"reporter_account_id" uuid,
	"reason" varchar(80) NOT NULL,
	"description" varchar(2000),
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by_account_id" uuid,
	"decision_note" varchar(2000),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "resource_reports" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"resource_id" uuid NOT NULL,
	"reporter_account_id" uuid,
	"reason" varchar(80) NOT NULL,
	"description" varchar(2000),
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by_account_id" uuid,
	"decision_note" varchar(2000),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"kind" "resource_kind" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_tags" (
	"resource_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "resource_tags_resource_id_tag_id_pk" PRIMARY KEY("resource_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tag_aliases" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"tag_id" uuid NOT NULL,
	"alias" varchar(64) NOT NULL,
	"normalized_alias" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tag_identity_terms" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"value" varchar(64) NOT NULL,
	"normalized_value" varchar(64) NOT NULL,
	"kind" "tag_identity_term_kind" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tag_merges" (
	"source_tag_id" uuid NOT NULL,
	"target_tag_id" uuid NOT NULL,
	"merged_by_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" varchar(32) NOT NULL,
	"slug" varchar(32) NOT NULL,
	"status" "tag_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "account_emails" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" uuid NOT NULL,
	"email" varchar(320) NOT NULL,
	"type" "user_email_type" NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_emails_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "account_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"locale" varchar(20),
	"profile_visibility" "profile_visibility",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"display_name" varchar(100),
	"avatar_media_id" uuid,
	"headline" varchar(160),
	"bio" varchar(500),
	"location" varchar(120),
	"portfolio_url" varchar(2048),
	"social_links" jsonb,
	CONSTRAINT "profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "account_roles" (
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	CONSTRAINT "account_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"voluntary_status" "account_voluntary_status" DEFAULT 'active' NOT NULL,
	"moderation_status" "account_moderation_status" DEFAULT 'none' NOT NULL,
	"deletion_status" "account_deletion_status" DEFAULT 'none' NOT NULL,
	"deletion_requested_at" timestamp with time zone,
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"locked_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" "role_name" NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "auth_flow_proof" (
	"jti" uuid PRIMARY KEY NOT NULL,
	"purpose" varchar(64) NOT NULL,
	"subject_id" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credential_oauth" (
	"id" uuid PRIMARY KEY NOT NULL,
	"provider" varchar(50) NOT NULL,
	"provider_user_id" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credential_passkey" (
	"id" uuid PRIMARY KEY NOT NULL,
	"webauthn_id" varchar(1024) NOT NULL,
	"public_key" varchar(4096) NOT NULL,
	"counter" integer DEFAULT 0 NOT NULL,
	"device_type" "passkey_device_type" NOT NULL,
	"backed_up" boolean DEFAULT false NOT NULL,
	"transports" jsonb,
	"device_name" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "credential_password" (
	"id" uuid PRIMARY KEY NOT NULL,
	"verifier" varchar(512) NOT NULL,
	"opaque_user_identifier" varchar(128) NOT NULL,
	"scheme" "password_scheme" DEFAULT 'OPAQUE' NOT NULL,
	"failed_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "credential" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "credential_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mfa_recovery_code" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" uuid NOT NULL,
	"code_hash" varchar(255) NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mfa_totp" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" uuid NOT NULL,
	"encrypted_secret" varchar(512) NOT NULL,
	"status" "mfa_totp_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mfa_totp_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" uuid NOT NULL,
	"credential_id" uuid,
	"auth_method" "auth_method" NOT NULL,
	"session_secret_hash" varchar(255) NOT NULL,
	"ip_address" "inet",
	"user_agent" varchar(512),
	"device_name" varchar(100),
	"authenticated_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_memberships" (
	"organization_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"role" "organization_membership_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_memberships_organization_id_account_id_pk" PRIMARY KEY("organization_id","account_id")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" varchar(160) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"type" "organization_type" NOT NULL,
	"description" text NOT NULL,
	"website_url" varchar(2048),
	"avatar_url" varchar(2048),
	"created_by_account_id" uuid NOT NULL,
	"status" "organization_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_views" (
	"account_id" uuid NOT NULL,
	"resource_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "resource_views_account_id_resource_id_pk" PRIMARY KEY("account_id","resource_id")
);
--> statement-breakpoint
CREATE TABLE "view_statistics" (
	"resource_id" uuid PRIMARY KEY NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_votes" (
	"resource_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "resource_votes_account_id_resource_id_pk" PRIMARY KEY("account_id","resource_id")
);
--> statement-breakpoint
CREATE TABLE "vote_statistics" (
	"resource_id" uuid PRIMARY KEY NOT NULL,
	"vote_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_id_resources_id_fk" FOREIGN KEY ("id") REFERENCES "public"."resources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_accounts_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_cover_media_id_media_objects_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media_objects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_bookmarks" ADD CONSTRAINT "resource_bookmarks_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_bookmarks" ADD CONSTRAINT "resource_bookmarks_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_statistics" ADD CONSTRAINT "comment_statistics_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_account_id_accounts_id_fk" FOREIGN KEY ("author_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_same_resource_fk" FOREIGN KEY ("parent_id","resource_id") REFERENCES "public"."comments"("id","resource_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_reporter_account_id_accounts_id_fk" FOREIGN KEY ("reporter_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_screenshot_media_id_media_objects_id_fk" FOREIGN KEY ("screenshot_media_id") REFERENCES "public"."media_objects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_suggestions" ADD CONSTRAINT "event_suggestions_submitted_by_account_id_accounts_id_fk" FOREIGN KEY ("submitted_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_suggestions" ADD CONSTRAINT "event_suggestions_accepted_event_id_events_id_fk" FOREIGN KEY ("accepted_event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_suggestions" ADD CONSTRAINT "event_suggestions_decided_by_account_id_accounts_id_fk" FOREIGN KEY ("decided_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_id_resources_id_fk" FOREIGN KEY ("id") REFERENCES "public"."resources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_cover_media_id_media_objects_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media_objects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_resource_suggestions" ADD CONSTRAINT "external_resource_suggestions_accepted_external_resource_id_external_resources_id_fk" FOREIGN KEY ("accepted_external_resource_id") REFERENCES "public"."external_resources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_resource_suggestions" ADD CONSTRAINT "external_resource_suggestions_submitted_by_account_id_accounts_id_fk" FOREIGN KEY ("submitted_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_resource_suggestions" ADD CONSTRAINT "external_resource_suggestions_decided_by_account_id_accounts_id_fk" FOREIGN KEY ("decided_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_resources" ADD CONSTRAINT "external_resources_id_resources_id_fk" FOREIGN KEY ("id") REFERENCES "public"."resources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag_follows" ADD CONSTRAINT "tag_follows_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag_follows" ADD CONSTRAINT "tag_follows_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_suggestions" ADD CONSTRAINT "job_suggestions_submitted_by_account_id_accounts_id_fk" FOREIGN KEY ("submitted_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_suggestions" ADD CONSTRAINT "job_suggestions_accepted_job_id_jobs_id_fk" FOREIGN KEY ("accepted_job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_suggestions" ADD CONSTRAINT "job_suggestions_decided_by_account_id_accounts_id_fk" FOREIGN KEY ("decided_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_id_resources_id_fk" FOREIGN KEY ("id") REFERENCES "public"."resources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_publisher_organization_id_organizations_id_fk" FOREIGN KEY ("publisher_organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_objects" ADD CONSTRAINT "media_objects_owner_account_id_accounts_id_fk" FOREIGN KEY ("owner_account_id") REFERENCES "public"."accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_restrictions" ADD CONSTRAINT "account_restrictions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_restrictions" ADD CONSTRAINT "account_restrictions_applied_by_account_id_accounts_id_fk" FOREIGN KEY ("applied_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_restrictions" ADD CONSTRAINT "account_restrictions_revoked_by_account_id_accounts_id_fk" FOREIGN KEY ("revoked_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_references" ADD CONSTRAINT "news_references_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_references" ADD CONSTRAINT "news_references_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_id_resources_id_fk" FOREIGN KEY ("id") REFERENCES "public"."resources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_cover_media_id_media_objects_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media_objects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_suggestions" ADD CONSTRAINT "news_suggestions_submitted_by_account_id_accounts_id_fk" FOREIGN KEY ("submitted_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_suggestions" ADD CONSTRAINT "news_suggestions_accepted_news_id_news_id_fk" FOREIGN KEY ("accepted_news_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_suggestions" ADD CONSTRAINT "news_suggestions_decided_by_account_id_accounts_id_fk" FOREIGN KEY ("decided_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_id_resources_id_fk" FOREIGN KEY ("id") REFERENCES "public"."resources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_author_account_id_accounts_id_fk" FOREIGN KEY ("author_account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_id_resources_id_fk" FOREIGN KEY ("id") REFERENCES "public"."resources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_author_account_id_accounts_id_fk" FOREIGN KEY ("author_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_id_resources_id_fk" FOREIGN KEY ("id") REFERENCES "public"."resources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_author_account_id_accounts_id_fk" FOREIGN KEY ("author_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_accepted_answer_same_question_fk" FOREIGN KEY ("accepted_answer_id","id") REFERENCES "public"."answers"("id","question_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_reports" ADD CONSTRAINT "comment_reports_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_reports" ADD CONSTRAINT "comment_reports_reporter_account_id_accounts_id_fk" FOREIGN KEY ("reporter_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_reports" ADD CONSTRAINT "comment_reports_reviewed_by_account_id_accounts_id_fk" FOREIGN KEY ("reviewed_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_reports" ADD CONSTRAINT "resource_reports_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_reports" ADD CONSTRAINT "resource_reports_reporter_account_id_accounts_id_fk" FOREIGN KEY ("reporter_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_reports" ADD CONSTRAINT "resource_reports_reviewed_by_account_id_accounts_id_fk" FOREIGN KEY ("reviewed_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_tags" ADD CONSTRAINT "resource_tags_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_tags" ADD CONSTRAINT "resource_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag_aliases" ADD CONSTRAINT "tag_aliases_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag_merges" ADD CONSTRAINT "tag_merges_source_tag_id_tags_id_fk" FOREIGN KEY ("source_tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag_merges" ADD CONSTRAINT "tag_merges_target_tag_id_tags_id_fk" FOREIGN KEY ("target_tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag_merges" ADD CONSTRAINT "tag_merges_merged_by_id_accounts_id_fk" FOREIGN KEY ("merged_by_id") REFERENCES "public"."accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_emails" ADD CONSTRAINT "account_emails_user_id_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_preferences" ADD CONSTRAINT "account_preferences_user_id_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_avatar_media_id_media_objects_id_fk" FOREIGN KEY ("avatar_media_id") REFERENCES "public"."media_objects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_roles" ADD CONSTRAINT "account_roles_user_id_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_roles" ADD CONSTRAINT "account_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_flow_proof" ADD CONSTRAINT "auth_flow_proof_subject_id_accounts_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_oauth" ADD CONSTRAINT "credential_oauth_id_credential_id_fk" FOREIGN KEY ("id") REFERENCES "public"."credential"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_passkey" ADD CONSTRAINT "credential_passkey_id_credential_id_fk" FOREIGN KEY ("id") REFERENCES "public"."credential"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_password" ADD CONSTRAINT "credential_password_id_credential_id_fk" FOREIGN KEY ("id") REFERENCES "public"."credential"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential" ADD CONSTRAINT "credential_user_id_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mfa_recovery_code" ADD CONSTRAINT "mfa_recovery_code_user_id_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mfa_totp" ADD CONSTRAINT "mfa_totp_user_id_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_credential_id_credential_id_fk" FOREIGN KEY ("credential_id") REFERENCES "public"."credential"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_created_by_account_id_accounts_id_fk" FOREIGN KEY ("created_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_views" ADD CONSTRAINT "resource_views_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_views" ADD CONSTRAINT "resource_views_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "view_statistics" ADD CONSTRAINT "view_statistics_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_votes" ADD CONSTRAINT "resource_votes_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_votes" ADD CONSTRAINT "resource_votes_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote_statistics" ADD CONSTRAINT "vote_statistics_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "articles_author_id_status_idx" ON "articles" USING btree ("author_id","status");--> statement-breakpoint
CREATE INDEX "articles_title_idx" ON "articles" USING btree ("title");--> statement-breakpoint
CREATE INDEX "articles_reading_time_minutes_idx" ON "articles" USING btree ("reading_time_minutes");--> statement-breakpoint
CREATE INDEX "articles_published_at_idx" ON "articles" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "resource_bookmarks_account_active_updated_idx" ON "resource_bookmarks" USING btree ("account_id","active","updated_at");--> statement-breakpoint
CREATE INDEX "resource_bookmarks_resource_active_idx" ON "resource_bookmarks" USING btree ("resource_id","active");--> statement-breakpoint
CREATE INDEX "comments_resource_created_idx" ON "comments" USING btree ("resource_id","created_at");--> statement-breakpoint
CREATE INDEX "comments_parent_id_idx" ON "comments" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "feedback_reporter_created_idx" ON "feedback" USING btree ("reporter_account_id","created_at");--> statement-breakpoint
CREATE INDEX "feedback_status_created_idx" ON "feedback" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "feedback_reporter_idempotency_uidx" ON "feedback" USING btree ("reporter_account_id","idempotency_key") WHERE "feedback"."idempotency_key" is not null;--> statement-breakpoint
CREATE INDEX "notifications_account_created_idx" ON "notifications" USING btree ("account_id","created_at","id");--> statement-breakpoint
CREATE INDEX "notifications_account_seen_idx" ON "notifications" USING btree ("account_id","seen_at");--> statement-breakpoint
CREATE INDEX "notifications_account_read_idx" ON "notifications" USING btree ("account_id","read_at");--> statement-breakpoint
CREATE INDEX "notifications_created_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "notifications_account_type_source_uq" ON "notifications" USING btree ("account_id","type","source_type","source_id") WHERE "notifications"."source_type" is not null and "notifications"."source_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "event_suggestions_pending_url_uidx" ON "event_suggestions" USING btree ("url") WHERE "event_suggestions"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "event_suggestions_submitter_idx" ON "event_suggestions" USING btree ("submitted_by_account_id","created_at");--> statement-breakpoint
CREATE INDEX "event_suggestions_status_idx" ON "event_suggestions" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "events_slug_unique_idx" ON "events" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "events_url_unique_idx" ON "events" USING btree ("url") WHERE "events"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "events_discovery_idx" ON "events" USING btree ("status","starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "external_resource_suggestions_status_idx" ON "external_resource_suggestions" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "external_resource_suggestions_pending_url_uidx" ON "external_resource_suggestions" USING btree ("url") WHERE "external_resource_suggestions"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "external_resources_title_idx" ON "external_resources" USING btree ("title");--> statement-breakpoint
CREATE UNIQUE INDEX "external_resources_active_url_uidx" ON "external_resources" USING btree ("url") WHERE "external_resources"."status" in ('active', 'archived');--> statement-breakpoint
CREATE INDEX "job_suggestions_status_idx" ON "job_suggestions" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "job_suggestions_submitter_idx" ON "job_suggestions" USING btree ("submitted_by_account_id","created_at");--> statement-breakpoint
CREATE INDEX "jobs_active_expiry_idx" ON "jobs" USING btree ("status","expires_at");--> statement-breakpoint
CREATE INDEX "jobs_organization_status_idx" ON "jobs" USING btree ("publisher_organization_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "media_objects_object_key_uidx" ON "media_objects" USING btree ("object_key");--> statement-breakpoint
CREATE INDEX "media_objects_owner_status_idx" ON "media_objects" USING btree ("owner_account_id","status");--> statement-breakpoint
CREATE INDEX "media_objects_pending_created_at_idx" ON "media_objects" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "account_restrictions_account_idx" ON "account_restrictions" USING btree ("account_id","capability");--> statement-breakpoint
CREATE INDEX "account_restrictions_effective_idx" ON "account_restrictions" USING btree ("account_id","capability","starts_at","ends_at");--> statement-breakpoint
CREATE UNIQUE INDEX "news_references_news_url_uidx" ON "news_references" USING btree ("news_id","url");--> statement-breakpoint
CREATE INDEX "news_references_source_idx" ON "news_references" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "news_title_idx" ON "news" USING btree ("title");--> statement-breakpoint
CREATE INDEX "news_published_at_idx" ON "news" USING btree ("published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "news_suggestions_pending_url_uidx" ON "news_suggestions" USING btree ("url") WHERE "news_suggestions"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "news_suggestions_status_idx" ON "news_suggestions" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "projects_author_status_idx" ON "projects" USING btree ("author_account_id","status");--> statement-breakpoint
CREATE INDEX "projects_published_idx" ON "projects" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "answers_question_created_idx" ON "answers" USING btree ("question_id","created_at");--> statement-breakpoint
CREATE INDEX "answers_question_hidden_created_idx" ON "answers" USING btree ("question_id","hidden_at","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "answers_question_accepted_uidx" ON "answers" USING btree ("question_id") WHERE "answers"."accepted_at" is not null;--> statement-breakpoint
CREATE INDEX "questions_status_created_idx" ON "questions" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "questions_status_hidden_created_idx" ON "questions" USING btree ("status","hidden_at","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "comment_reports_pending_reporter_comment_uidx" ON "comment_reports" USING btree ("reporter_account_id","comment_id") WHERE "comment_reports"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "comment_reports_status_created_idx" ON "comment_reports" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "resource_reports_pending_reporter_resource_uidx" ON "resource_reports" USING btree ("reporter_account_id","resource_id") WHERE "resource_reports"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "resource_reports_status_created_idx" ON "resource_reports" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "resource_tags_by_tag_idx" ON "resource_tags" USING btree ("tag_id","resource_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tag_aliases_normalized_alias_unique" ON "tag_aliases" USING btree ("normalized_alias");--> statement-breakpoint
CREATE INDEX "tag_aliases_tag_id_idx" ON "tag_aliases" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tag_identity_terms_normalized_value_unique" ON "tag_identity_terms" USING btree ("normalized_value");--> statement-breakpoint
CREATE UNIQUE INDEX "tag_merges_source_unique" ON "tag_merges" USING btree ("source_tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_emails_account_type_idx" ON "account_emails" USING btree ("user_id","type");--> statement-breakpoint
CREATE UNIQUE INDEX "account_emails_email_lower_idx" ON "account_emails" USING btree (lower("email"));--> statement-breakpoint
CREATE INDEX "account_roles_role_idx" ON "account_roles" USING btree ("role_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_roles_user_unique" ON "account_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "accounts_voluntary_status_idx" ON "accounts" USING btree ("voluntary_status");--> statement-breakpoint
CREATE INDEX "accounts_moderation_status_idx" ON "accounts" USING btree ("moderation_status");--> statement-breakpoint
CREATE INDEX "accounts_deletion_status_idx" ON "accounts" USING btree ("deletion_status");--> statement-breakpoint
CREATE INDEX "accounts_deletion_requested_at_idx" ON "accounts" USING btree ("deletion_requested_at");--> statement-breakpoint
CREATE INDEX "auth_flow_proof_expiry_idx" ON "auth_flow_proof" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "auth_flow_proof_subject_purpose_idx" ON "auth_flow_proof" USING btree ("subject_id","purpose");--> statement-breakpoint
CREATE UNIQUE INDEX "credential_oauth_provider_provider_user_id_idx" ON "credential_oauth" USING btree ("provider","provider_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "credential_passkey_webauthn_id_idx" ON "credential_passkey" USING btree ("webauthn_id");--> statement-breakpoint
CREATE INDEX "credential_user_type_idx" ON "credential" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "mfa_recovery_code_user_idx" ON "mfa_recovery_code" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mfa_totp_user_idx" ON "mfa_totp" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_secret_hash_idx" ON "sessions" USING btree ("session_secret_hash");--> statement-breakpoint
CREATE INDEX "organization_memberships_account_idx" ON "organization_memberships" USING btree ("account_id","role");--> statement-breakpoint
CREATE INDEX "organization_memberships_org_role_idx" ON "organization_memberships" USING btree ("organization_id","role");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_slug_unique_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "organizations_status_name_idx" ON "organizations" USING btree ("status","name");--> statement-breakpoint
CREATE INDEX "organizations_deleted_at_idx" ON "organizations" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "resource_views_resource_idx" ON "resource_views" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "resource_votes_resource_active_idx" ON "resource_votes" USING btree ("resource_id","active");