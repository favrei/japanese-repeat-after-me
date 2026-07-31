import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const catalogEntries = sqliteTable(
  "catalog_entries",
  {
    storyId: text("story_id").notNull(),
    version: text("version").notNull(),
    titleJa: text("title_ja").notNull(),
    titleEn: text("title_en").notNull(),
    packKey: text("pack_key").notNull(),
    status: text("status", {
      enum: ["draft", "published", "retired"],
    })
      .notNull()
      .default("draft"),
    isCurrent: integer("is_current", { mode: "boolean" })
      .notNull()
      .default(false),
    publishedAt: text("published_at"),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    primaryKey({ columns: [table.storyId, table.version] }),
    check(
      "catalog_entries_status_check",
      sql`${table.status} IN ('draft', 'published', 'retired')`,
    ),
    check(
      "catalog_entries_current_published_check",
      sql`${table.isCurrent} = 0 OR ${table.status} = 'published'`,
    ),
    check(
      "catalog_entries_published_timestamp_check",
      sql`${table.status} != 'published' OR ${table.publishedAt} IS NOT NULL`,
    ),
    uniqueIndex("catalog_entries_current_story_unique")
      .on(table.storyId)
      .where(sql`${table.isCurrent} = 1`),
    index("catalog_entries_public_idx").on(
      table.status,
      table.isCurrent,
      table.updatedAt,
    ),
  ],
);
