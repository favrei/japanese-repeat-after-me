import {
  CATALOG_BACKUP_SCHEMA_VERSION,
  CATALOG_SCHEMA_VERSION,
  catalogPackPath,
  parseCatalogBackup,
  type CatalogBackup,
  type CatalogBackupEntry,
  type CatalogEntry,
  type CatalogResponse,
} from "../shared/catalog";
import type {
  D1DatabaseLike,
  D1PreparedStatementLike,
} from "./cloudflare";

type CatalogRow = {
  story_id: string;
  version: string;
  title_ja: string;
  title_en: string;
  pack_key: string;
  status: "draft" | "published" | "retired";
  is_current: number;
  published_at: string | null;
  updated_at: string;
};

const CATALOG_COLUMNS = `
  story_id,
  version,
  title_ja,
  title_en,
  pack_key,
  status,
  is_current,
  published_at,
  updated_at
`;

function rowToEntry(row: CatalogRow): CatalogEntry {
  if (row.published_at === null) {
    throw new TypeError("published catalog row has no published timestamp");
  }
  const entry = {
    id: row.story_id,
    version: row.version,
    title: {
      ja: row.title_ja,
      en: row.title_en,
    },
    packPath: `/${row.pack_key}`,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  };

  // Also verifies that a stored pack key cannot escape the versioned route.
  if (entry.packPath !== catalogPackPath(entry.id, entry.version)) {
    throw new TypeError("catalog row has an invalid pack key");
  }
  return entry;
}

function rowToBackupEntry(row: CatalogRow): CatalogBackupEntry {
  const entry = {
    id: row.story_id,
    version: row.version,
    title: {
      ja: row.title_ja,
      en: row.title_en,
    },
    packPath: `/${row.pack_key}`,
    status: row.status,
    isCurrent: row.is_current === 1,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  };
  if (entry.packPath !== catalogPackPath(entry.id, entry.version)) {
    throw new TypeError("catalog row has an invalid pack key");
  }
  return entry;
}

async function readCatalogRows(
  db: D1DatabaseLike,
  publishedOnly: boolean,
): Promise<CatalogRow[]> {
  const where = publishedOnly
    ? "WHERE status = 'published' AND is_current = 1"
    : "";
  const result = await db
    .prepare(
      `SELECT ${CATALOG_COLUMNS}
       FROM catalog_entries
       ${where}
       ORDER BY story_id ASC, version ASC`,
    )
    .all<CatalogRow>();
  return result.results ?? [];
}

export async function listPublishedCatalog(
  db: D1DatabaseLike,
): Promise<CatalogResponse> {
  const rows = await readCatalogRows(db, true);
  return {
    schemaVersion: CATALOG_SCHEMA_VERSION,
    entries: rows.map(rowToEntry),
  };
}

export async function exportCatalog(
  db: D1DatabaseLike,
  exportedAt = new Date().toISOString(),
): Promise<CatalogBackup> {
  const rows = await readCatalogRows(db, false);
  return {
    schemaVersion: CATALOG_BACKUP_SCHEMA_VERSION,
    exportedAt,
    entries: rows.map(rowToBackupEntry),
  };
}

function insertStatement(
  db: D1DatabaseLike,
  entry: CatalogBackupEntry,
): D1PreparedStatementLike {
  return db
    .prepare(
      `INSERT INTO catalog_entries (
         story_id,
         version,
         title_ja,
         title_en,
         pack_key,
         status,
         is_current,
         published_at,
         updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      entry.id,
      entry.version,
      entry.title.ja,
      entry.title.en,
      entry.packPath.slice(1),
      entry.status,
      entry.isCurrent ? 1 : 0,
      entry.publishedAt,
      entry.updatedAt,
    );
}

/**
 * Replace the catalog table from a validated logical backup.
 *
 * This is intentionally not exposed as an HTTP route. A future production
 * operator must provide an authenticated control path before cloud restore is
 * enabled.
 */
export async function restoreCatalog(
  db: D1DatabaseLike,
  value: unknown,
): Promise<void> {
  const backup = parseCatalogBackup(value);
  const statements = [
    db.prepare("DELETE FROM catalog_entries"),
    ...backup.entries.map((entry) => insertStatement(db, entry)),
  ];
  await db.batch(statements);
}
