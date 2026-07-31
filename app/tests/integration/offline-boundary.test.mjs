import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import {
  advanceTarget,
  openingTarget,
  resolveBubbleEvent,
} from "../../client/gameplay/flow.ts";
import { STORIES } from "../../client/content/stories.ts";

async function listSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const url = new URL(entry.name, directory);
    if (entry.isDirectory()) {
      files.push(...(await listSourceFiles(new URL(`${entry.name}/`, directory))));
    } else if (/\.(?:ts|tsx)$/.test(entry.name)) {
      files.push(url);
    }
  }
  return files;
}

test("client source has no dependency on server implementation", async () => {
  const files = await listSourceFiles(
    new URL("../../client/", import.meta.url),
  );
  for (const file of files) {
    const source = await readFile(file, "utf8");
    assert.doesNotMatch(source, /(?:from|import\()\s*["'][^"']*server\//);
  }
});

test("every downloaded story completes while backend requests fail", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("backend unavailable");
  };

  try {
    for (const story of STORIES) {
      const opening = openingTarget(0);
      assert.equal(opening.kind, "interlude");
      let position = opening.position;
      let completed = false;

      while (!completed) {
        const decision = resolveBubbleEvent("skip", 0);
        assert.equal(decision.advance, true);
        const target = advanceTarget(story.flow, position);
        if (target.kind === "complete") {
          completed = true;
        } else {
          position = target.position;
        }
      }

      assert.equal(position, story.flow.length - 1);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});
