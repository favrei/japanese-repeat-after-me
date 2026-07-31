import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  advanceTarget,
  openingTarget,
  resolveBubbleEvent,
} from "../../client/gameplay/flow.ts";
import { STORIES } from "../../client/content/stories.ts";
import { FLOW, STAGES } from "../../client/content/cafe.ts";
import { TAPROOM_STORY } from "../../client/content/taproom.ts";

test("keeps the redesigned café story intact", () => {
  assert.equal(STAGES.length, 2);
  assert.deepEqual(
    STAGES.map((stage) => stage.bubbles.length),
    [7, 6],
  );
  assert.equal(FLOW.length, 13);
  assert.deepEqual(
    FLOW.filter((bubble) => bubble.mode === "speak").map(
      (bubble) => bubble.translation,
    ),
    [
      "A menu, please.",
      "The house blend, please.",
      "A receipt, please.",
      "By card, please.",
    ],
  );
  assert.deepEqual(
    FLOW.filter((bubble) => bubble.mode === "autoplay").map(
      (bubble) => bubble.translation,
    ),
    [
      "Welcome.",
      "Are you ready to order?",
      "Today’s recommendation is the house blend.",
      "Please call me when you’re ready.",
      "Thank you.",
      "Please pay at the register.",
      "You can pay by cash or card.",
      "Thank you very much.",
      "Please come again.",
    ],
  );
  assert.ok(
    FLOW.filter((bubble) => bubble.mode === "autoplay").every((bubble) =>
      bubble.audioSrc?.startsWith("/audio/qwen3/"),
    ),
  );
  assert.ok(
    FLOW.filter((bubble) => bubble.mode === "autoplay").every(
      (bubble) => bubble.speaker === "staff",
    ),
  );
  assert.ok(
    FLOW.filter((bubble) => bubble.mode === "speak").every(
      (bubble) => bubble.speaker === "learner",
    ),
  );
});

test("ships four selectable stages across café and taproom stories", () => {
  assert.deepEqual(
    STORIES.map((story) => story.id),
    ["cafe-conversation", "taproom-first-glass"],
  );
  assert.equal(
    STORIES.reduce((count, story) => count + story.stages.length, 0),
    4,
  );
  assert.deepEqual(
    TAPROOM_STORY.stages.map((stage) => stage.bubbles.length),
    [7, 6],
  );
  assert.equal(TAPROOM_STORY.flow.length, 13);
  assert.equal(
    TAPROOM_STORY.flow.filter((bubble) => bubble.mode === "speak").length,
    5,
  );
  assert.ok(
    TAPROOM_STORY.flow
      .filter((bubble) => bubble.mode === "autoplay")
      .every((bubble) => bubble.audioSrc?.startsWith("/audio/taproom/")),
  );
});

test("one success advances the current bubble", () => {
  assert.deepEqual(resolveBubbleEvent("success", 0), {
    advance: true,
    failedAttempts: 0,
  });
});

test("the first two failures keep the current bubble active", () => {
  assert.deepEqual(resolveBubbleEvent("failure", 0), {
    advance: false,
    failedAttempts: 1,
  });
  assert.deepEqual(resolveBubbleEvent("failure", 1), {
    advance: false,
    failedAttempts: 2,
  });
});

test("the third failure advances the current bubble", () => {
  assert.deepEqual(resolveBubbleEvent("failure", 2), {
    advance: true,
    failedAttempts: 3,
  });
});

test("Skip advances exactly one bubble without adding a failure", () => {
  assert.deepEqual(resolveBubbleEvent("skip", 2), {
    advance: true,
    failedAttempts: 2,
  });
});

test("every stage declares its shot, its cast, and a narrated break", () => {
  for (const story of STORIES) {
    for (const stage of story.stages) {
      assert.ok(stage.sceneId, `${stage.id} has no sceneId`);
      assert.ok(stage.castId, `${stage.id} has no castId`);
      assert.ok(stage.transition?.id, `${stage.id} has no transition`);
      assert.ok(stage.transition.japanese.length > 0);
      assert.ok(stage.transition.reading.length > 0);
      assert.ok(stage.transition.translation.length > 0);
    }
  }
});

test("stage scene and cast keys resolve against the story's art pack", async () => {
  for (const story of STORIES) {
    const pack = JSON.parse(
      await readFile(
        new URL(`../../art-packs/${story.artPackId}.json`, import.meta.url),
        "utf8",
      ),
    );

    for (const stage of story.stages) {
      assert.ok(
        pack.scenes[stage.sceneId],
        `${stage.id} points at missing scene "${stage.sceneId}"`,
      );
      assert.ok(
        pack.characters[stage.castId],
        `${stage.id} points at missing character "${stage.castId}"`,
      );
    }
  }
});

test("the story opens on a transition rather than mid-sentence", () => {
  assert.deepEqual(openingTarget(), {
    kind: "interlude",
    position: 0,
    stageIndex: 0,
  });
});

test("a directly selected second stage opens on its own transition", () => {
  assert.deepEqual(openingTarget(1), {
    kind: "interlude",
    position: 0,
    stageIndex: 1,
  });
});

test("a transition plays at every stage boundary and nowhere else", () => {
  const boundaries = [];
  for (let position = 0; position < FLOW.length; position += 1) {
    const target = advanceTarget(FLOW, position);
    if (target.kind === "interlude") boundaries.push(target);
  }

  // Thirteen bubbles across two stages: exactly one internal boundary, at the
  // seventh bubble's dismissal.
  assert.deepEqual(boundaries, [
    { kind: "interlude", position: 7, stageIndex: 1 },
  ]);
});

test("advancing inside a stage stays on bubbles, and the last bubble completes", () => {
  assert.deepEqual(advanceTarget(FLOW, 0), { kind: "bubble", position: 1 });
  assert.deepEqual(advanceTarget(FLOW, FLOW.length - 1), { kind: "complete" });
});

test("a transition never changes the bubble count a stage owns", () => {
  for (const story of STORIES) {
    const bubblesReachedPerStage = new Map();
    for (const bubble of story.flow) {
      bubblesReachedPerStage.set(
        bubble.stageIndex,
        (bubblesReachedPerStage.get(bubble.stageIndex) ?? 0) + 1,
      );
    }

    assert.deepEqual(
      [...bubblesReachedPerStage.entries()],
      story.stages.map((stage, index) => [index, stage.bubbles.length]),
    );
  }
});
