import assert from "node:assert/strict";
import test from "node:test";
import { normalizeJapanese, scoreAttempt } from "../app/scoring.ts";
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
