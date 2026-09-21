DROP INDEX "tag_aliases_normalized_alias_unique";--> statement-breakpoint
DROP INDEX "tag_identity_terms_normalized_value_unique";--> statement-breakpoint
UPDATE "tag_aliases" SET "alias" = "normalized_alias";--> statement-breakpoint
UPDATE "tag_identity_terms" SET "value" = "normalized_value";--> statement-breakpoint
ALTER TABLE "tag_aliases" ALTER COLUMN "alias" SET DATA TYPE varchar(32);--> statement-breakpoint
ALTER TABLE "tag_identity_terms" ALTER COLUMN "value" SET DATA TYPE varchar(32);--> statement-breakpoint
CREATE UNIQUE INDEX "tag_aliases_alias_unique" ON "tag_aliases" USING btree ("alias");--> statement-breakpoint
CREATE UNIQUE INDEX "tag_identity_terms_value_unique" ON "tag_identity_terms" USING btree ("value");--> statement-breakpoint
ALTER TABLE "tag_aliases" DROP COLUMN "normalized_alias";--> statement-breakpoint
ALTER TABLE "tag_identity_terms" DROP COLUMN "normalized_value";
