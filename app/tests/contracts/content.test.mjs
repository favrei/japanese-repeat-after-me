import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  CATALOG_SCHEMA_VERSION,
  catalogPackPath,
  parseCatalogResponse,
} from "../../shared/catalog.ts";
import {
  STORY_PACK_SCHEMA_VERSION,
  assertStoryPack,
} from "../../shared/story-pack.ts";
import { STORIES } from "../../client/content/stories.ts";

const NOW = "2026-07-31T12:00:00.000Z";

test("catalog payloads preserve the versioned immutable pack path", () => {
  const value = {
    schemaVersion: CATALOG_SCHEMA_VERSION,
    entries: [
      {
        id: "cafe-conversation",
        version: "1",
        title: { ja: "喫茶店のひととき", en: "A moment at the café" },
        packPath: catalogPackPath("cafe-conversation", "1"),
        publishedAt: NOW,
        updatedAt: NOW,
      },
    ],
  };

  assert.deepEqual(parseCatalogResponse(value), value);
  assert.throws(
    () =>
      parseCatalogResponse({
        ...value,
        entries: [{ ...value.entries[0], packPath: "/packs/other/1/pack.json" }],
      }),
    /does not match/,
  );
});

test("bundled stories satisfy the same story-pack reference contract", async () => {
  for (const story of STORIES) {
    const artPack = JSON.parse(
      await readFile(
        new URL(`../../art-packs/${story.artPackId}.json`, import.meta.url),
        "utf8",
      ),
    );

    assert.doesNotThrow(() =>
      assertStoryPack({
        schemaVersion: STORY_PACK_SCHEMA_VERSION,
        id: story.id,
        version: "1",
        story,
        artPack,
      }),
    );
  }
});
