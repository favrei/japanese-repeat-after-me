import assert from "node:assert/strict";
import test from "node:test";
import {
  CONTENT_ACCEPT_THRESHOLD,
  markReadingHits,
  normalizeJapanese,
  scoreAttempt,
} from "../../client/gameplay/scoring.ts";
import { CAFE_STORY, STAGES } from "../../client/content/cafe.ts";

const target = STAGES[0].bubbles.find(
  (bubble) => bubble.id === "ordering-order",
);

test("normalizes Japanese kana and punctuation", () => {
  assert.equal(normalizeJapanese(" ブレンドコーヒー！ "), "ぶれんどこーひー");
});

test("accepts the known line in kanji or kana", () => {
  assert.ok(target);
  assert.equal(scoreAttempt([target.japanese], target).passed, true);
  assert.equal(scoreAttempt([target.reading], target).passed, true);
});

test("rejects an unrelated café line", () => {
  assert.ok(target);
  const result = scoreAttempt(["お手洗いはどこですか。"], target);
  assert.equal(result.passed, false);
  assert.ok(result.score < CONTENT_ACCEPT_THRESHOLD);
});

test("requires the presented line to be closest in the selected story", () => {
  assert.ok(target);
  const speakingBubbles = CAFE_STORY.flow.filter(
    (bubble) => bubble.mode === "speak",
  );
  const receipt = speakingBubbles.find(
    (bubble) => bubble.id === "meal-restroom",
  );
  assert.ok(receipt);

  const result = scoreAttempt(
    [receipt.japanese],
    target,
    speakingBubbles,
  );
  assert.equal(result.passed, false);
  assert.equal(result.nearestLineId, receipt.id);
});

test("uses the experiment 006 content threshold", () => {
  assert.equal(CONTENT_ACCEPT_THRESHOLD, 0.3);
});

test("marks every kana as hit for an exact attempt", () => {
  assert.ok(target);
  const marks = markReadingHits(target.reading, target.reading);
  assert.ok(marks.length > 0);
  for (const mark of marks) {
    assert.notEqual(mark.state, "miss", `unexpected miss for ${mark.char}`);
  }
  assert.equal(
    marks.find((mark) => mark.char === "。")?.state,
    "plain",
  );
});

test("marks only the substituted kana as miss", () => {
  assert.ok(target);
  const missed = target.reading.replace("ぶれんど", "ぶれんご");
  assert.notEqual(missed, target.reading);
  const marks = markReadingHits(target.reading, missed);
  const missChars = marks
    .filter((mark) => mark.state === "miss")
    .map((mark) => mark.char);
  assert.deepEqual(missChars, ["ど"]);
});

test("marks deleted kana as miss", () => {
  assert.ok(target);
  const dropped = target.reading.replace("こーひー", "こひー");
  const marks = markReadingHits(target.reading, dropped);
  const missChars = marks
    .filter((mark) => mark.state === "miss")
    .map((mark) => mark.char);
  assert.deepEqual(missChars, ["ー"]);
});
