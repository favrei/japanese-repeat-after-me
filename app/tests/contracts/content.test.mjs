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

test("every stage transition ships its narration", async () => {
  for (const story of STORIES) {
    for (const stage of story.stages) {
      // Playback never falls back to a synthetic voice for narration, so a
      // transition without a clip opens the stage in silence.
      const { audioSrc } = stage.transition;
      assert.ok(audioSrc, `${story.id}/${stage.id}: narration has no clip`);
      const clip = await readFile(
        new URL(`../../public${audioSrc}`, import.meta.url),
      );
      assert.ok(clip.byteLength > 1_000, `${audioSrc} is not audio`);
    }
  }
});

test("every speaking bubble ships a model clip the learner can hear", async () => {
  for (const story of STORIES) {
    for (const stage of story.stages) {
      for (const bubble of stage.bubbles) {
        if (bubble.mode !== "speak") continue;
        // Without a bundled clip, playback falls back to the system voice —
        // not a reviewed reference reading of the line being scored.
        assert.ok(
          bubble.audioSrc,
          `${story.id}/${stage.id}: "${bubble.japanese}" has no model clip`,
        );
        const clip = await readFile(
          new URL(`../../public${bubble.audioSrc}`, import.meta.url),
        );
        assert.ok(clip.byteLength > 1_000, `${bubble.audioSrc} is not audio`);
      }
    }
  }
});

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
