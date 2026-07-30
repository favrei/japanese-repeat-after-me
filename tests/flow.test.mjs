import assert from "node:assert/strict";
import test from "node:test";
import { resolveBubbleEvent } from "../app/flow.ts";
import { FLOW, STAGES } from "../app/stages.ts";

test("ships the specified two-stage, nine-bubble conversation", () => {
  assert.equal(STAGES.length, 2);
  assert.deepEqual(
    STAGES.map((stage) => stage.bubbles.length),
    [6, 3],
  );
  assert.equal(FLOW.length, 9);
  assert.deepEqual(
    FLOW.filter((bubble) => bubble.mode === "speak").map(
      (bubble) => bubble.translation,
    ),
    [
      "Two burgers, one beer.",
      "Please chicken burger for lady, beer and beef burger for me.",
      "Where is the restroom?",
    ],
  );
  assert.deepEqual(
    FLOW.filter((bubble) => bubble.mode === "autoplay").map(
      (bubble) => bubble.translation,
    ),
    [
      "Welcome, please come in.",
      "What can I bring for you?",
      "Oh, give me a second.",
      "Where is the menu?",
      "Yes sir, thank you for the ordering.",
      "Here is the meal.",
    ],
  );
  assert.ok(
    FLOW.filter((bubble) => bubble.mode === "autoplay").every((bubble) =>
      bubble.audioSrc?.startsWith("/audio/qwen3/"),
    ),
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
