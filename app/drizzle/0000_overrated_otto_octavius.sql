CREATE TABLE `catalog_entries` (
	`story_id` text NOT NULL,
	`version` text NOT NULL,
	`title_ja` text NOT NULL,
	`title_en` text NOT NULL,
	`pack_key` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`is_current` integer DEFAULT false NOT NULL,
	`published_at` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`story_id`, `version`),
	CONSTRAINT "catalog_entries_status_check" CHECK("catalog_entries"."status" IN ('draft', 'published', 'retired')),
	CONSTRAINT "catalog_entries_current_published_check" CHECK("catalog_entries"."is_current" = 0 OR "catalog_entries"."status" = 'published'),
	CONSTRAINT "catalog_entries_published_timestamp_check" CHECK("catalog_entries"."status" != 'published' OR "catalog_entries"."published_at" IS NOT NULL)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `catalog_entries_current_story_unique` ON `catalog_entries` (`story_id`) WHERE "catalog_entries"."is_current" = 1;--> statement-breakpoint
CREATE INDEX `catalog_entries_public_idx` ON `catalog_entries` (`status`,`is_current`,`updated_at`);