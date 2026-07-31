import { env, exports as workerExports } from "cloudflare:workers";
import { beforeEach, describe, expect, it } from "vitest";
import { exportCatalog, restoreCatalog } from "../../server/catalog";
import {
  CATALOG_SCHEMA_VERSION,
  catalogPackPath,
  parseCatalogResponse,
} from "../../shared/catalog";

const NOW = "2026-07-31T12:00:00.000Z";

async function insertCatalogRow({
  id = "cafe-conversation",
  version = "1",
  status = "published",
  isCurrent = true,
  publishedAt = NOW,
}: {
  id?: string;
  version?: string;
  status?: "draft" | "published" | "retired";
  isCurrent?: boolean;
  publishedAt?: string | null;
} = {}) {
  await env.DB.prepare(
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
      id,
      version,
      id === "cafe-conversation" ? "喫茶店のひととき" : "下書き",
      id === "cafe-conversation" ? "A moment at the café" : "Draft",
      catalogPackPath(id, version).slice(1),
      status,
      isCurrent ? 1 : 0,
      publishedAt,
      NOW,
    )
    .run();
}

beforeEach(async () => {
  await env.DB.prepare("DELETE FROM catalog_entries").run();
});

describe("catalog API with local D1", () => {
  it("returns only current published entries through the Worker route", async () => {
    await insertCatalogRow();
    await insertCatalogRow({
      version: "0",
      status: "retired",
      isCurrent: false,
    });
    await insertCatalogRow({
      id: "draft-story",
      status: "draft",
      isCurrent: false,
      publishedAt: null,
    });

    const response = await workerExports.default.fetch(
      "https://example.test/api/catalog",
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain(
      "stale-while-revalidate",
    );

    const catalog = parseCatalogResponse(await response.json());
    expect(catalog.schemaVersion).toBe(CATALOG_SCHEMA_VERSION);
    expect(catalog.entries).toEqual([
      {
        id: "cafe-conversation",
        version: "1",
        title: {
          ja: "喫茶店のひととき",
          en: "A moment at the café",
        },
        packPath: "/packs/cafe-conversation/1/pack.json",
        publishedAt: NOW,
        updatedAt: NOW,
      },
    ]);
  });

  it("keeps catalog methods read-only", async () => {
    const response = await workerExports.default.fetch(
      "https://example.test/api/catalog",
      { method: "POST" },
    );
    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET, HEAD");
  });

  it("applies the migration constraints to a fresh local D1 database", async () => {
    await insertCatalogRow();

    await expect(insertCatalogRow({ version: "2" })).rejects.toThrow(
      /unique constraint/i,
    );
    await expect(
      insertCatalogRow({
        id: "bad-current",
        status: "draft",
        isCurrent: true,
        publishedAt: null,
      }),
    ).rejects.toThrow(/check constraint/i);
  });
});

describe("pack API with local R2", () => {
  it("serves immutable objects with stored HTTP metadata and ETags", async () => {
    const key = "packs/cafe-conversation/1/pack.json";
    await env.PACKS.put(key, JSON.stringify({ id: "cafe-conversation" }), {
      httpMetadata: { contentType: "application/json; charset=utf-8" },
    });

    const response = await workerExports.default.fetch(
      `https://example.test/${key}`,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "application/json; charset=utf-8",
    );
    expect(response.headers.get("cache-control")).toContain("immutable");
    expect(await response.json()).toEqual({ id: "cafe-conversation" });

    const listed = await env.PACKS.list({
      prefix: "packs/cafe-conversation/1/",
    });
    expect(listed.objects.map((object) => object.key)).toContain(key);

    const head = await workerExports.default.fetch(
      `https://example.test/${key}`,
      { method: "HEAD" },
    );
    expect(head.status).toBe(200);
    expect(await head.text()).toBe("");

    const conditional = await workerExports.default.fetch(
      `https://example.test/${key}`,
      { headers: { "if-none-match": response.headers.get("etag") ?? "" } },
    );
    expect(conditional.status).toBe(304);
  });

  it("rejects non-versioned paths and returns a bounded missing-object error", async () => {
    const invalid = await workerExports.default.fetch(
      "https://example.test/packs/cafe-conversation/../secret.json",
    );
    expect(invalid.status).toBe(400);

    const missing = await workerExports.default.fetch(
      "https://example.test/packs/cafe-conversation/1/missing.json",
    );
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({
      code: "pack_not_found",
      error: "Pack object not found.",
    });
  });
});

describe("catalog backup and restore with local D1", () => {
  it("round-trips current, retired, and draft rows", async () => {
    await insertCatalogRow();
    await insertCatalogRow({
      version: "0",
      status: "retired",
      isCurrent: false,
    });
    await insertCatalogRow({
      id: "draft-story",
      status: "draft",
      isCurrent: false,
      publishedAt: null,
    });

    const backup = await exportCatalog(env.DB, NOW);
    expect(backup.entries.map((entry) => entry.status)).toEqual([
      "retired",
      "published",
      "draft",
    ]);

    await env.DB.prepare("DELETE FROM catalog_entries").run();
    await restoreCatalog(env.DB, backup);

    const restored = await exportCatalog(env.DB, NOW);
    expect(restored).toEqual(backup);
  });

  it("validates a backup before deleting existing data", async () => {
    await insertCatalogRow();

    await expect(
      restoreCatalog(env.DB, {
        schemaVersion: 999,
        exportedAt: NOW,
        entries: [],
      }),
    ).rejects.toThrow(/unsupported catalog backup/);

    const remaining = await exportCatalog(env.DB, NOW);
    expect(remaining.entries).toHaveLength(1);
  });
});
