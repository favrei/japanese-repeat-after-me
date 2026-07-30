import assert from "node:assert/strict";
import test from "node:test";
import {
  markReadingHits,
  normalizeJapanese,
  scoreAttempt,
} from "../app/scoring.ts";
import { STAGES } from "../app/stages.ts";

const target = STAGES[0].bubbles.find(
  (bubble) => bubble.id === "ordering-order",
);

test("normalizes Japanese kana and punctuation", () => {
  assert.equal(normalizeJapanese(" ハンバーガー！ "), "はんばーがー");
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
  assert.ok(result.score < 0.56);
});

test("marks every kana as hit for an exact attempt", () => {
  assert.ok(target);
  const marks = markReadingHits(target.reading, target.reading);
  assert.ok(marks.length > 0);
  for (const mark of marks) {
    assert.notEqual(mark.state, "miss", `unexpected miss for ${mark.char}`);
  }
  assert.equal(
    marks.find((mark) => mark.char === "、")?.state,
    "plain",
  );
});

test("marks only the substituted kana as miss", () => {
  assert.ok(target);
  const missed = target.reading.replace("ふたつ", "みっつ");
  assert.notEqual(missed, target.reading);
  const marks = markReadingHits(target.reading, missed);
  const misses = marks
    .map((mark, index) => (mark.state === "miss" ? index : -1))
    .filter((index) => index >= 0);
  const expected = Array.from(target.reading).flatMap((char, index) =>
    ["ふ", "た"].includes(char) && index < target.reading.indexOf("、")
      ? [index]
      : [],
  );
  assert.deepEqual(misses, expected);
});

test("marks deleted kana as miss", () => {
  assert.ok(target);
  const dropped = target.reading.replace("びーる", "びる");
  const marks = markReadingHits(target.reading, dropped);
  const missChars = marks
    .filter((mark) => mark.state === "miss")
    .map((mark) => mark.char);
  assert.deepEqual(missChars, ["ー"]);
});
