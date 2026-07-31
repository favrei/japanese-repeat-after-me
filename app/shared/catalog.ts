export const CATALOG_SCHEMA_VERSION = 1;
export const CATALOG_BACKUP_SCHEMA_VERSION = 1;

const CONTENT_ID = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
const CONTENT_VERSION = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

export type CatalogEntry = {
  id: string;
  version: string;
  title: {
    ja: string;
    en: string;
  };
  packPath: string;
  publishedAt: string;
  updatedAt: string;
};

export type CatalogResponse = {
  schemaVersion: typeof CATALOG_SCHEMA_VERSION;
  entries: CatalogEntry[];
};

export type CatalogBackup = {
  schemaVersion: typeof CATALOG_BACKUP_SCHEMA_VERSION;
  exportedAt: string;
  entries: CatalogBackupEntry[];
};

export type CatalogBackupEntry = Omit<CatalogEntry, "publishedAt"> & {
  status: "draft" | "published" | "retired";
  isCurrent: boolean;
  publishedAt: string | null;
};

function requireRecord(
  value: unknown,
  label: string,
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function requireTimestamp(value: unknown, label: string): string {
  const timestamp = requireString(value, label);
  if (!Number.isFinite(Date.parse(timestamp))) {
    throw new TypeError(`${label} must be an ISO-compatible timestamp`);
  }
  return timestamp;
}

function optionalTimestamp(value: unknown, label: string): string | null {
  return value === null ? null : requireTimestamp(value, label);
}

export function catalogPackPath(id: string, version: string): string {
  if (!CONTENT_ID.test(id)) {
    throw new TypeError("catalog id contains unsupported characters");
  }
  if (!CONTENT_VERSION.test(version)) {
    throw new TypeError("catalog version contains unsupported characters");
  }
  return `/packs/${id}/${version}/pack.json`;
}

export function parseCatalogEntry(
  value: unknown,
  label = "catalog entry",
): CatalogEntry {
  const entry = requireRecord(value, label);
  const id = requireString(entry.id, `${label}.id`);
  const version = requireString(entry.version, `${label}.version`);
  const title = requireRecord(entry.title, `${label}.title`);
  const parsed = {
    id,
    version,
    title: {
      ja: requireString(title.ja, `${label}.title.ja`),
      en: requireString(title.en, `${label}.title.en`),
    },
    packPath: requireString(entry.packPath, `${label}.packPath`),
    publishedAt: requireTimestamp(
      entry.publishedAt,
      `${label}.publishedAt`,
    ),
    updatedAt: requireTimestamp(entry.updatedAt, `${label}.updatedAt`),
  };

  if (parsed.packPath !== catalogPackPath(id, version)) {
    throw new TypeError(`${label}.packPath does not match its id and version`);
  }
  return parsed;
}

export function parseCatalogResponse(value: unknown): CatalogResponse {
  const response = requireRecord(value, "catalog response");
  if (response.schemaVersion !== CATALOG_SCHEMA_VERSION) {
    throw new TypeError("unsupported catalog schema version");
  }
  if (!Array.isArray(response.entries)) {
    throw new TypeError("catalog response entries must be an array");
  }
  return {
    schemaVersion: CATALOG_SCHEMA_VERSION,
    entries: response.entries.map((entry, index) =>
      parseCatalogEntry(entry, `catalog response.entries[${index}]`),
    ),
  };
}

export function parseCatalogBackup(value: unknown): CatalogBackup {
  const backup = requireRecord(value, "catalog backup");
  if (backup.schemaVersion !== CATALOG_BACKUP_SCHEMA_VERSION) {
    throw new TypeError("unsupported catalog backup schema version");
  }
  if (!Array.isArray(backup.entries)) {
    throw new TypeError("catalog backup entries must be an array");
  }
  return {
    schemaVersion: CATALOG_BACKUP_SCHEMA_VERSION,
    exportedAt: requireTimestamp(backup.exportedAt, "catalog backup.exportedAt"),
    entries: backup.entries.map((value, index) => {
      const label = `catalog backup.entries[${index}]`;
      const entry = requireRecord(value, label);
      const id = requireString(entry.id, `${label}.id`);
      const version = requireString(entry.version, `${label}.version`);
      const title = requireRecord(entry.title, `${label}.title`);
      const status = entry.status;
      if (
        status !== "draft" &&
        status !== "published" &&
        status !== "retired"
      ) {
        throw new TypeError(`${label}.status is invalid`);
      }
      if (typeof entry.isCurrent !== "boolean") {
        throw new TypeError(`${label}.isCurrent must be a boolean`);
      }

      const parsed: CatalogBackupEntry = {
        id,
        version,
        title: {
          ja: requireString(title.ja, `${label}.title.ja`),
          en: requireString(title.en, `${label}.title.en`),
        },
        packPath: requireString(entry.packPath, `${label}.packPath`),
        status,
        isCurrent: entry.isCurrent,
        publishedAt: optionalTimestamp(
          entry.publishedAt,
          `${label}.publishedAt`,
        ),
        updatedAt: requireTimestamp(entry.updatedAt, `${label}.updatedAt`),
      };

      if (parsed.packPath !== catalogPackPath(id, version)) {
        throw new TypeError(
          `${label}.packPath does not match its id and version`,
        );
      }
      if (parsed.isCurrent && parsed.status !== "published") {
        throw new TypeError(`${label} current entries must be published`);
      }
      if (parsed.status === "published" && parsed.publishedAt === null) {
        throw new TypeError(`${label} published entries need publishedAt`);
      }
      return parsed;
    }),
  };
}
